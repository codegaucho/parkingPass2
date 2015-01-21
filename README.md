Parking Pass

=========

Parking Pass is a ASP.NET MVC5 C# application written by Tom Murphy (tom@codegaucho.com)

Not rocket science, but will let our users request a parking pass for our Edison NJ facility.  When parking pass is ready, user will be notified to pick up.

For those users not in Active Directory (and thus without the ability to request a pass), they can stop by the office.  These users will be matched with our PACS system for security.  These users will need to electronically sign that they are agreeing to the terms.

A nice demo of the use of MongoDb (using MongoRepository), and RabbitMQ


Usage

----

modify the Web.config and add in the connection string for your mongo db
<add name="MongoServerSettings" connectionString="mongodb://user:password@server/database" />


Version

----


0.0



Tech

-----------
Parking Pass uses a number of projects to work properly
* [Twitter Bootstrap] - keeps everything similar and simple
* [dojo] - I like their AMD implementation, and defining classes
* [jQuery] - while I prefer dojo's syntax, Bootstrap needs jQuery, and there are an occasional thing that is easier with jQuery over dojo
* [Dillinger] - used to create this markdown document


newGet
-----------
Parking Pass uses a couple of newGet packages
* [MongoRepository] - to provide the MongoDB driver and a repository pattern
* [RabbitMQ Client] - to allow us to log to RabbitMQ



License

----

MIT


[tom murphy]:http://codegaucho.com

[Twitter Bootstrap]:http://twitter.github.com/bootstrap/
[dojo]:http://dojotoolkit.org
[jQuery]:http://jquery.com
[Dillinger]:http://dillinger.io

[MongoRepository]:http://mongorepository.codeplex.com/
[RabbitMQ Client]:http://www.rabbitmq.com/dotnet.html

