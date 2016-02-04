# url reducer



This app uses node.js running on heroku

	<pre>http://nintex.herokuapp.com</pre>


and couchbase 4.0 running on amazon 

	<pre>http://ec2-54-191-226-92.us-west-2.compute.amazonaws.com:8091</pre>


REST calls -

<pre>http://nintex.herokuapp.com/url				to execute a reduced url</pre>
<pre>http://nintex.herokuapp.com/seed				to create/advance the next generated url</pre>
<pre>http://nintex.herokuapp.com/reduce/:key 		read/write a reduced url record</pre>
<pre>http://nintex.herokuapp.com/findKeys/:url		find all the keys for a particular url</pre>
<pre>http://nintex.herokuapp.com/config</pre>

Examples

<pre>http://nintex.herokuapp.com/url/myKey</pre>
<pre>http://nintex.herokuapp.com/seed</pre>
<pre>http://nintex.herokuapp.com/reduce/myKey</pre>
<pre>http://nintex.herokuapp.com/reduce/myKey&url=www.google.com</pre>
<pre>http://nintex.herokuapp.com/findKeys/bing</pre>

Testing - run "npm test" in root directory

