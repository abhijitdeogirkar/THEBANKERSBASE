const API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"; 
let customersData = [];

// पेज लोड झाल्यावर डेटा खेचणे (Fetch)
document.addEventListener("DOMContentLoaded", () => {
    fetch(API_URL + "?action=getCustomers")
        .then(response => response.json())
        .then(data => {
            customersData = data;
            document.getElementById("loading").style.display = "none";
            displayCustomers(customersData);
        })
        .catch(error => {
            document.getElementById("loading").innerText = "डेटा लोड करताना त्रुटी आली.";
            console.error("Error fetching data: ", error);
        });
});

// यादी दाखवणे
function displayCustomers(data) {
    const listDiv = document.getElementById("customer-list");
    listDiv.innerHTML = "";
    data.forEach((cust, index) => {
        if(cust.Customer_Name) {
            let item = document.createElement("button");
            item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
            item.innerHTML = `<div><strong>${cust.Customer_Name}</strong><br><small class="text-muted">ID: ${cust.Customer_ID} | Mob: ${cust.Mobile_No}</small></div>`;
            item.onclick = () => viewProfile(index);
            listDiv.appendChild(item);
        }
    });
}

// सर्च फंक्शन
function searchCustomer() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filtered = customersData.filter(c => 
        (c.Customer_Name && c.Customer_Name.toLowerCase().includes(input)) || 
        (c.Customer_ID && c.Customer_ID.toString().toLowerCase().includes(input))
    );
    displayCustomers(filtered);
}

// प्रोफाईल पाहणे व लॉजिक (Recommendation & Links)
function viewProfile(index) {
    const cust = customersData[index];
    
    document.getElementById("directory-view").style.display = "none";
    document.getElementById("profile-view").style.display = "block";

    document.getElementById("p-name").innerText = cust.Customer_Name || "N/A";
    document.getElementById("p-cid").innerText = cust.Customer_ID || "N/A";
    document.getElementById("p-acc").innerText = cust.Account_No || "N/A";
    document.getElementById("p-mobile").innerText = cust.Mobile_No || "N/A";
    document.getElementById("p-email").innerText = cust.Email_Id || "N/A";
    document.getElementById("p-occ").innerText = cust.Occupation || "N/A";
    document.getElementById("p-org").innerText = cust.Organisation || "N/A";
    document.getElementById("p-address").innerText = cust.Address || "N/A";

    // Communication Links Update
    document.getElementById("btn-call").href = `tel:+91${cust.Mobile_No}`;
    document.getElementById("btn-sms").href = `sms:+91${cust.Mobile_No}`;
    
    let waMsg = encodeURIComponent(`नमस्कार ${cust.Customer_Name}, बँकेच्या नवीन योजनेबाबत माहिती देण्यासाठी संपर्क करत आहे...`);
    document.getElementById("btn-wa").href = `https://wa.me/91${cust.Mobile_No}?text=${waMsg}`;

    // Recommendation Engine (तुम्ही हे लॉजिक तुमच्या अटींनुसार वाढवू शकता)
    let recList = document.getElementById("p-recommendations");
    recList.innerHTML = "";
    
    if(cust.Car && cust.Car.toString().toLowerCase() === "no") {
        recList.innerHTML += `<li>4 Wheeler Loan (आधार, पॅन, सॅलरी स्लिप आवश्यक)</li>`;
    }
    if(cust.Roof_top_Solar && cust.Roof_top_Solar.toString().toLowerCase() === "no" && cust.Residence.toString().toLowerCase() === "owned") {
        recList.innerHTML += `<li>Solar Loan (घर स्वतःचे असल्यामुळे पात्र)</li>`;
    }
    if(cust.EV && cust.EV.toString().toLowerCase() === "no") {
        recList.innerHTML += `<li>EV Loan (नवीन ईव्ही खरेदीसाठी)</li>`;
    }
    if(recList.innerHTML === "") {
        recList.innerHTML = "<li>सध्या कोणतीही विशिष्ट शिफारस नाही.</li>";
    }
}

function showDirectory() {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("directory-view").style.display = "block";
}

// PDF डाउनलोड फंक्शन
function downloadPDF() {
    const element = document.getElementById('printable-profile');
    const custName = document.getElementById("p-name").innerText;
    const opt = {
        margin:       1,
        filename:     `${custName}_Report.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
