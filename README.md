# url reducer



This app uses node.js running on heroku

-- http://nintex.herokuapp.com


and couchbase 4.0 running on amazon 

-- http://ec2-54-191-226-92.us-west-2.compute.amazonaws.com:8091


REST calls -

http://nintex.herokuapp.com/url   			to execute a reduced url<br>
http://nintex.herokuapp.com/seed  			to create/advance the next generated url<br>
http://nintex.herokuapp.com/read    		read an existing url record<br>
http://nintex.herokuapp.com/write   		create a url record<br>
http://nintex.herokuapp.com/findKeys/:url	find all the keys for a particular url<br>


Examples<br>

http://nintex.herokuapp.com/url/myKey
http://nintex.herokuapp.com/seed  	
http://nintex.herokuapp.com/read?key=myKey
http://nintex.herokuapp.com/write?key=myKey&url=www.google.com
http://nintex.herokuapp.com/findKeys?url=www.google.com

Testing - run "npm test" in root directory

