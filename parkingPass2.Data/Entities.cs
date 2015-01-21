using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoRepository;

// for data annotaions and validations
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace parkingPass2.Data
{
    /*
     * Flash is used to display alerts to the screen
     */
    public class Flash
    {
        public string type { get; set; }
        public string body { get; set; }
        public string title { get; set; }
    }

    /*
     * Log entries are going to be kept in their own collection - Log (this may end if we really get into rabbit MQ)
     * We are also going to toss the log out to rabbit MQ - thus we need an app id and title (get from ARS)
     * 
     * index by:
     * RefId
     */
    public class Log : Entity
    {
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public string Comment { get; set; }
        public string RefId { get; set; }
        public string AppId { get; set; }
        public string AppTitle { get; set; }
        public string URL { get; set; }
        //added some fields to map better to syslog
        //Severity: Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug - see http://en.wikipedia.org/wiki/Syslog or RFC5424
        public string Severity { get; set; }
        public string Hostname { get; set; }
        //App-Name - use AppTitle
    }

    /*
     * roles allow us to assign superusers that can work across locations
     * 
     * index by:
     * Title
     */
    public class Role : Entity
    {
        public string Title { get; set; }
        public HashSet<string> Members { get; set; }
        public string Body { get; set; }
    }

    /*
     * MailAddresses are multipart.  Junkmail filters are currently catching things with display name - so we aren't using the DisplayName much
     * but we will store both parts for now (it is also needed for calendar entries)
     */
    public class eMailAddress
    {
        public string Address { get; set; }
        public string DisplayName { get; set; }
    }

    /*
     * A template is used for sending mail, or for providing text blurbs at various points
     * 
     * index by:
     * Key
     */
    public class Template : Entity
    {
        [Required]
        public string Key { get; set; }

        public string Description { get; set; }
        public string Priority { get; set; }
        public eMailAddress From { get; set; }
        public List<eMailAddress> SendTo { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        //retired, all templates will be html or mime
        //public bool isHTML { get; set; }
    }

    /*
     * Vehicle Class represents a vehicle - right now only plate and state, but we can extend this to make, model, ...
     */
    public class VehicleClass
    {
        [Required]
        public string Plate { get; set; }

        [Required]
        public string State { get; set; }
    }

    /*
     * we are making all that don't have access to the network sign via signature pad
     */
    public class SignatureClass
    {
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; }
        //public string Client_Name { get; set; }
        public string Signature_Encoded { get; set; }
    }

    /*
     * a tag is the properties of the tag itself (as opposed to the ticket which represents the request for a tag
     */
    public class TagClass
    {
        public string Color { get; set; }
        public string Number { get; set; }
        public DateTime Expires { get; set; }
        public DateTime Issued { get; set; }
        public DateTime Distributed { get; set; }
        public string IssuedBy { get; set; }
        public string DistributedBy { get; set; }
    }

    /*
     * PACS Class represents the data we pull from PACS.  For those not in AD, we will be requiring this
     * maps to what is returnd by https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/PacsUser/chiu%20yue-on
     * 
     * CardID is actually the employee record ID
     * CardInfoID is the ID of the card itself
     * we are just using the same fieldnames as PACS
     */
    public class PACSClass 
    {
        public string CardID { get; set; }
        public string CardInfoID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ActiveDateTime { get; set; }
        public string InactiveDateTime { get; set; }
        public string ExpirationDateTime { get; set; }
        public string DateTimeOfTxn { get; set; }
    }

    //I do believe ADManagerClass has been retired
    public class ADManagerClass
    {
        public string LanId {get; set;}
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CN {get; set;}
        public string UPN {get; set;}
        public string WorkForceID { get; set; }
    }

    /*
     * ADClass represents the data returned for a user from AD
     * maps to what is returned by 
     * https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUsersList/all/region-r02 for the userlist
     * we don't have the feed from yue-on yet, so can't flesh this out
     * userlist is a list of names we are going to use in bloodhound, and has some information.  Once a name is selected, we go to the user feed for the remainder
     */
    public class ADClass
    {
        //from the userlist feed
        public string LanId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string PersonnelType { get; set; }
        public string Affiliation { get; set; }
        public string UPN { get; set; }
        //from the user feed
        public string WorkForceID { get; set; }
        public string ManagerName { get; set; }
        //public ADManagerClass Manager { get; set; }
        public string CN { get; set; }
        //public string SeeAlso { get; set; }
        public string Company { get; set; }
        public string Organization { get; set; }
        //public string DisplayName { get; set; }
        public string AmpBox { get; set; }
        public string ExpirationDate { get; set; }
    }

    /*
     * MULClass represents the data returned from a check of R2's Master User List and other sources
     * http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/lanid/ychiu
     */
    public class MULClass
    {
        public string EmployeeId { get; set; }
        public string EName { get; set; }
        public string LanId { get; set; }
        public string Org { get; set; }
        public string Phone { get; set; }
        public string Location { get; set; }
        public string AmpBox { get; set; }
        public string EpaEmployee { get; set; }
        public string EmpType {get; set;}
        public string Email { get; set; }
        public string ContractCompany { get; set; }
        public string SupervisorFirst { get; set; }
        public string Expiration { get; set; }
    }

    /*
     * the TagHolder Class represents the person holding the tag
     * 
     * SystemOfRecord tells us what system is being used to prove this user belongs:  currently AD, PACS, or MUL
     */
    public class TagHolderClass
    {
        //the basic info we need about a user trickles down to here, even though form a good amount of data it is also in either PACS, AD, or MUL

        [Required]
        public string DisplayName { get; set; }

        public string LanId { get; set; }

        [Required]
        public string Office { get; set; }
             
        public string AmpBox { get; set; }
        public string Supervisor { get; set; }
        public string Organization {get; set;}
        public string Company { get; set; }

        [Display(Name = "Office Phone")]
        public string Phone {get; set;}

        [Required]
        [Display(Name = "Client Cell")]
        [StringLength(15, MinimumLength = 9, ErrorMessage = "* A valid phone number is required.")]
        [Phone(ErrorMessage = "Please enter a valid phone number.")]
        public string Cell {get; set;}

        [Display(Name = "Email Address")]
        [Required(ErrorMessage = "The email address is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email {get; set;}

        public string SystemOfRecord { get; set; }
        public string PersonnelType {get; set;} 
        public bool IsEPA {get; set;}
        public DateTime ExpirationDate { get; set; }
        public PACSClass PACS { get; set; }
        public ADClass AD {get; set;}
        public MULClass MUL { get; set; }
    }

    /* 
     * A pass represents the ticket for requesting a parking tag
     * 
     * index by :
     * Client.LanId
     * Client.DisplayName
     * Client.Office Client.DisplayName
     */
    public class Ticket : Entity
    {
        public string UpdatedBy { get; set; }
        public DateTime Updated { get; set; }
        public TagHolderClass Client { get; set; }
        public TagClass Tag { get; set; }

        [Required]
        public List<VehicleClass> Vehicles { get; set; }

        public SignatureClass Signature { get; set; }
        public string Status { get; set; }
        public string RequestType { get; set; }
        //public string Body { get; set; }
    }

    /*
     * represents an on site contractor listed by a po for possible tag
     */
    public class Contractor : Entity
    {
        [Required]
        public string DisplayName { get; set; }

        [Required]
        public string ContractId { get; set; }

        [Display(Name = "Office Phone")]
        public string Phone { get; set; }

        [Display(Name = "Client Cell")]
        public string Cell { get; set; }

        [Display(Name = "Email Address")]
        public string Email { get; set; }

        public string SystemOfRecord { get; set; }
        public DateTime ExpirationDate { get; set; }
        public PACSClass PACS { get; set; }
        public ADClass AD {get; set;}
        public MULClass MUL { get; set; }
     
    }

    /*
     *  represents a company that has a contract with us
     */
    public class CompanyClass
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
    }

    /*
     * represents a contract which a PO will be adding basic info and then adding contractors
     */
    public class Contract : Entity
    {
        public string DisplayName { get; set; }
        public CompanyClass Company { get; set; }
        public ADClass PO { get; set; }
    }
}
