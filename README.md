# url reducer


[URL Reducer Design](https://broward.ghost.io/2016/02/03/code-exercise-2/)

This app uses node.js running on heroku

	http://couchbase-ex.herokuapp.com


and couchbase 4.0 running on amazon 

	http://ec2-54-191-226-92.us-west-2.compute.amazonaws.com:8091


REST calls -

<pre>http://couchbase-ex.herokuapp.com/url				to execute a reduced url
http://couchbase-ex.herokuapp.com/seed				to create/advance the next generated url
http://couchbase-ex.herokuapp.com/reduce/:key 		read/write a reduced url record
http://couchbase-ex.herokuapp.com/findKeys/:url		find all the keys for a particular url<
http://couchbase-ex.herokuapp.com/config</pre>

Examples

<pre>http://couchbase-ex.herokuapp.com/url/myKey
http://couchbase-ex.herokuapp.com/seed
http://couchbase-ex.herokuapp.com/reduce/myKey
http://couchbase-ex.herokuapp.com/reduce/myKey&url=www.google.com
http://couchbase-ex.herokuapp.com/findKeys/bing</pre>

Testing - run "npm test" in root directory

