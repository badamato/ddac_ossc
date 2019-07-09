#!/usr/bin/python

import time, uuid, requests, urllib2, paramiko, json, re
from random import randint

from flask import Flask, jsonify, abort, request, make_response, url_for, Response
from flask_cors import CORS, cross_origin

from dse.cluster import Cluster, ExecutionProfile, EXEC_PROFILE_DEFAULT
from dse.auth import PlainTextAuthProvider
from dse.policies import DCAwareRoundRobinPolicy,TokenAwarePolicy, ConstantSpeculativeExecutionPolicy
from dse import ConsistencyLevel

from ssl import PROTOCOL_TLSv1, CERT_REQUIRED, CERT_OPTIONAL

from ConfigParser import ConfigParser

app = Flask(__name__)
CORS(app)

config = ConfigParser()
config.read('demo.ini')

#Configuration

ddaccontactpoints = config.get('CONFIG','ddaccontactpoints').split(',')
osscontactpoints = config.get('CONFIG','osscontactpoints').split(',')
localDC = config.get('KHAOS','localDC')
username = config.get('KHAOS','sshusername')
keyfile = config.get('KHAOS','sshkeyfile')
rowcount = config.getint('CONFIG','rowcount')
ks_query = config.get('CONFIG','ks_query')
auth_provider = PlainTextAuthProvider (username= config.get('CONFIG','clusteruser'), password= config.get('CONFIG','clusterpass'))

if config.getint('CONFIG','sslenabled') == 0:
  ssl_opts = None
else:
  ssl_opts = {
    'ca_certs':  config.get('CONFIG','sslca'),
    'ssl_version': PROTOCOL_TLSv1,
    'cert_reqs':  CERT_OPTIONAL
  }



#End Configuration
profile1 = ExecutionProfile( load_balancing_policy=DCAwareRoundRobinPolicy(local_dc='dc0', used_hosts_per_remote_dc=0),
                            speculative_execution_policy=ConstantSpeculativeExecutionPolicy(.05, 20),
                            consistency_level = ConsistencyLevel.ONE
)

profile2 = ExecutionProfile( load_balancing_policy=DCAwareRoundRobinPolicy(local_dc='dc1', used_hosts_per_remote_dc=0),
                            speculative_execution_policy=ConstantSpeculativeExecutionPolicy(.05, 20),
                            consistency_level = ConsistencyLevel.ONE
)

print ("Connecting to cluster")

ddacCluster = Cluster( contact_points=ddaccontactpoints,
                      auth_provider=auth_provider,
                      ssl_options=ssl_opts,
                      execution_profiles={EXEC_PROFILE_DEFAULT: profile1},
)

ossCluster = Cluster( contact_points=osscontactpoints,
                    auth_provider=auth_provider,
                    ssl_options=ssl_opts,
                    execution_profiles={EXEC_PROFILE_DEFAULT: profile2},
)


ddacSession = ddacCluster.connect()
ossSession = ossCluster.connect()

print ("Connected to cluster")

ddacSession.execute (ks_query)
ddacSession.execute (""" CREATE TABLE IF NOT EXISTS  demo.table2 (     bucket text,     ts timeuuid,     d text,     data1 text,     data2 text,     data3 text,     PRIMARY KEY (bucket, ts)) WITH CLUSTERING ORDER BY (ts desc) """)
ddacCluster.shutdown()

ossSession.execute (ks_query)
ossSession.execute (""" CREATE TABLE IF NOT EXISTS  demo.table2 (     bucket text,     ts timeuuid,     d text,     data1 text,     data2 text,     data3 text,     PRIMARY KEY (bucket, ts)) WITH CLUSTERING ORDER BY (ts desc) """)
ossCluster.shutdown()


#API Endpoints Below

#>>>>>>>>>>>>>>>>>>>>>>>INIT
@app.route('/')
def index():
  return "Ping? Pong!"


#>>>>>>>>>>>>>>>>>>>>>>>WRITE
@app.route('/demo/write', methods=['POST'])

def writev0():
  if not request.json or not 'count' in request.json or not 'dc' in request.json or not 'cl' in request.json or not 'targetCluster' in request.json:
    abort(400)
  dc = request.json['dc']
  count = request.json['count']
  targetCluster = request.json['targetCluster']
  cl = request.json['cl']
  if not cl == "ONE" and not cl == "TWO" and not cl == "ALL" and not cl == "LOCAL_QUORUM" and not cl == "QUORUM":
    abort(400)
  if cl == "ONE":
    CL = ConsistencyLevel.ONE
  if cl == "TWO":
    CL = ConsistencyLevel.TWO
  if cl == "LOCAL_QUORUM":
    CL = ConsistencyLevel.LOCAL_QUORUM
  if cl == "QUORUM":
    CL = ConsistencyLevel.QUORUM
  if cl == "ALL":
    CL = ConsistencyLevel.ALL

    #>>>>>>>>>>>>>>>>>>>>>>WRITESTREAM
    def writeStream(targetCluster):
      coordinator = dc
      last_c = coordinator
      used_dc = dc
      #current = time.localtime()

      profile1 = ExecutionProfile( load_balancing_policy=DCAwareRoundRobinPolicy(local_dc=dc, used_hosts_per_remote_dc=3),
                                  speculative_execution_policy=ConstantSpeculativeExecutionPolicy(.05, 20),
                                  consistency_level = CL
      )

      print ("Connecting to cluster")

      if (targetCluster == "DDAC"):
        contactpoints = ddaccontactpoints
      else: 
        contactpoints = osscontactpoints

      cluster = Cluster( contact_points=contactpoints,
                        auth_provider=auth_provider,
                        ssl_options=ssl_opts,
                        execution_profiles={EXEC_PROFILE_DEFAULT: profile1},
      )

      session = cluster.connect()

      x = 0
      y = 0
      while x <= count:
        r = {} #Results Dictionary
        current = time.localtime()
        bucket = str(current.tm_year) + str(current.tm_mon) + str(current.tm_mday) + str(current.tm_hour) + str(current.tm_min)
        r["d"] = time.strftime('%Y-%m-%dT%H:%M:%S', current)
        data1 = randint(1,100)
        data2 = randint(1,100)
        data3 = randint(1,100)
        query = """ INSERT INTO demo.table2 (bucket, ts, d, data1, data2, data3) VALUES ('%s', now(), '%s', '%s', '%s', '%s') """ % (str(bucket), str(r["d"]), str(data1), str(data2), str(data3))
        writefail = 0
        r["result"] = "Successful"
        try:
          session.execute(query)
        except Exception as e:
          print ("Write failed.")
          writefail = 1
          for i in e:
            errormsg = i
            errormsg = str(errormsg).replace('"', '')
          r["count"] = x
          r["dc"] = used_dc
          r["result"] = errormsg
          yield json.dumps(r) + "\r\n"
        if writefail == 1:
          cluster.shutdown() 
          return
          yield
        if(y == rowcount):
          y = 0
          try:
            future = session.execute_async (query, trace=True )
            result = future.result()
            try:
              trace = future.get_query_trace(1)
              coordinator =  trace.coordinator
            except:
              coordinator = last_c
            for h in session.hosts:
              if h.address == coordinator:
                  used_dc = h.datacenter
            r["count"] = x
            r["dc"] = used_dc
            yield json.dumps(r) + "\r\n"
          except Exception as e:
            for i in e:
              errormsg = i
              errormsg = str(errormsg).replace('"', '')
            print ("Trace failed.")
            r["count"] = x
            r["dc"] = used_dc
            r["result"] = errormsg
            yield json.dumps(r) + "\r\n"
            cluster.shutdown() 

          time.sleep(.03)  # an artificial delay
          x = x + 1
          y = y + 1
      cluster.shutdown()
    return Response(writeStream(targetCluster), content_type='application/stream+json')


#>>>>>>>>>>>>>>>>>>>>>>>READ
@app.route('/demo/read', methods=['POST'])
def read():
  if not request.json or not 'count' in request.json or not 'dc' in request.json or not 'cl' in request.json or not 'targetCluster' in request.json:
    abort(400)
  dc = request.json['dc']
  count = request.json['count']
  targetCluster = request.json['targetCluster']
  cl = request.json['cl']
  if not cl == "ONE" and not cl == "TWO" and not cl == "ALL" and not cl == "LOCAL_QUORUM" and not cl == "QUORUM":
    abort(400)
  if cl == "ONE":
    CL = ConsistencyLevel.ONE
  if cl == "TWO":
    CL = ConsistencyLevel.TWO
  if cl == "LOCAL_QUORUM":
    CL = ConsistencyLevel.LOCAL_QUORUM
  if cl == "QUORUM":
    CL = ConsistencyLevel.QUORUM
  if cl == "ALL":
    CL = ConsistencyLevel.ALL

    #>>>>>>>>>>>>>>>>>>>>>>WRITESTREAM
    def readStream(targetCluster):
      coordinator = dc
      last_c = coordinator
      used_dc = dc
      current = time.localtime()
      bucket = str(current.tm_year) + str(current.tm_mon) + str(current.tm_mday) + str(current.tm_hour) + str(current.tm_min)

      profile1 = ExecutionProfile( load_balancing_policy=DCAwareRoundRobinPolicy(local_dc=dc, used_hosts_per_remote_dc=3),
                                  speculative_execution_policy=ConstantSpeculativeExecutionPolicy(.05, 20),
                                  consistency_level = CL
      )

      print ("Connecting to cluster")

      if (targetCluster == "DDAC"):
        contactpoints = ddaccontactpoints
      else: 
        contactpoints = osscontactpoints

      cluster = Cluster( contact_points=contactpoints,
                        auth_provider=auth_provider,
                        ssl_options=ssl_opts,
                        execution_profiles={EXEC_PROFILE_DEFAULT: profile1},
      )

      session = cluster.connect()

      x = 0
      y = 0
      while x <= count:
        r = {} #Results Dictionary
        current = time.localtime()
        bucket = str(current.tm_year) + str(current.tm_mon) + str(current.tm_mday) + str(current.tm_hour) + str(current.tm_min)
        #r["d"] = time.strftime('%Y-%m-%dT%H:%M:%S', current)
        query = """ select * from demo.table2 where bucket = '%s' limit 1 """ % (bucket)
        readfail = 0
        r["result"] = "Successful"
        try:
          results = session.execute (query)
        except Exception as e:
          print ("Read failed.")
          readfail = 1
          for i in e:
            errormsg = i
            errormsg = str(errormsg).replace('"', '')
          r["count"] = x
          r["dc"] = used_dc
          r["result"] = errormsg
          r["d"] = "00:00:00"
          yield json.dumps(r) + "\r\n"
        if readfail == 1:
          cluster.shutdown()
          return
          yield

        for row in results:
          r["d"] = row.d

        if(y == rowcount):
          y = 0
          try:
            future = session.execute_async (query, trace=True )
            result = future.result()
            try:
              trace = future.get_query_trace( 1 )
              coordinator =  trace.coordinator
            except:
              coordinator = last_c
            for h in session.hosts:
              if h.address == coordinator:
                used_dc = h.datacenter
            r["count"] = x
            r["dc"] = used_dc
            yield json.dumps(r) + "\r\n"
          except Exception as e:
            for i in e:
              errormsg = i
              errormsg = str(errormsg).replace('"', '')
            print ("Read trace failed.")
            r["count"] = x
            r["dc"] = used_dc
            r["result"] = errormsg
            yield json.dumps(r) + "\r\n"
            cluster.shutdown()

          time.sleep(.03)  # an artificial delay
          x = x + 1
          y = y + 1
      cluster.shutdown()
    return Response(readStream(), content_type='application/stream+json')


#>>>>>>>>>>>>>>>>>>>>>>>NODEFULL
@app.route('/demo/nodefull', methods=['GET'])

def nodefull():
  nodes = [(ddaccontactpoints[0]), (osscontactpoints[0])]
  k = paramiko.RSAKey.from_private_key_file(keyfile)
  c = paramiko.SSHClient()
  result = []

  def statusOfNode(output, target):
    regex = r"^(?P<state>[UD][NLJ])\s+(?P<address>\S+)\s+(?P<load>\S+\s+\S+)\s+(?P<tokens>\d+)\s+(?P<owns>\S+)\s+(?P<hostid>\S+)\s+(?P<rack>\S+)$"
    matches = re.finditer(regex, output, re.MULTILINE)

    for matchNum, match in enumerate(matches, start=1):
        # print(match.groupdict())
        address = match.group("address")
        # print(address)
        if address == target:
          return match.group("state")
    return "nothing"

  for node in nodes:
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect( port = 22, hostname = node, username = username, pkey = k )
    stdin, stdout, stderr = c.exec_command("nodetool status")
    output = stdout.readlines()
    lines = "".join(output)
    status = statusOfNode(lines, node)
    print(status)
    result.append(status)

  return ",".join(result)


if __name__ == '__main__':
    app.run(debug=True)
