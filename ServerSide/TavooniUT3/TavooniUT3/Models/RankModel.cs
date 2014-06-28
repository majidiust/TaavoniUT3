using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TavooniUT3.Models
{
    public class RankModel
    {
        public double Point { get; set; }
        public Guid UserId { get; set; }
        public String UserName { get; set; }
        public String FirstName { get; set; }
        public String LastName { get; set; }
        public int Rank { get; set; }
        public String Date { get; set; }
        public bool IsApproved { get; set; }
    }
}