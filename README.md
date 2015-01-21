Parking Pass

=========

Parking Pass is a ASP.NET MVC5 C# application written by Tom Murphy (tom@codegaucho.com)

Not rocket science, but will let our users request a parking pass for our Edison NJ facility.  When parking pass is ready, user will be notified to pick up.

For those users not in Active Directory (and thus without the ability to request a pass), they can stop by the office.  These users will be matched with our PACS system for security.  These users will need to electronically sign that they are agreeing to the terms.

A nice demo of the use of MongoDb (using MongoRepository), and RabbitMQ


Usage

----

add Web.config in parkingPass2.Data along the lines of
```sh
<?xml version="1.0" encoding="utf-8"?>
<!--
  For more information on how to configure your ASP.NET application, please visit
  http://go.microsoft.com/fwlink/?LinkId=301880
  -->
<configuration>
  <appSettings>
    <add key="webpages:Version" value="3.0.0.0" />
    <add key="webpages:Enabled" value="false" />
    <add key="ClientValidationEnabled" value="true" />
    <add key="UnobtrusiveJavaScriptEnabled" value="true" />
  </appSettings>
  <system.web>
    <compilation debug="true" targetFramework="4.5" />
    <httpRuntime targetFramework="4.5" />
  </system.web>
<connectionStrings>
    <!-- See http://www.mongodb.org/display/DOCS/CSharp+Driver+Tutorial#CSharpDriverTutorial-Connectionstrings for more info -->
    <!-- this should be the connection string for your mongo database  -->
    <add name="MongoServerSettings" connectionString="mongodb://localhost/MyDatabase" /> 
</connectionStrings></configuration>
```

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

