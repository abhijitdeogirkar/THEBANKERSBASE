// तुमची Apps Script वेब लिंक इथे टाका
const API_URL = "https://script.google.com/macros/s/AKfycbzQkCFB1viIhiq5ruYYRfXI3VPCS_3F_g3ICMSxgoNzaA0Wb_WYNf4Q2bAFziW0X86xsg/exec"; 

function showPage(pageId) {
    document.querySelectorAll('.app-page').forEach(page => page.style.display = 'none');
    document.getElementById('page-' + pageId).style.display = 'block';
    
    document.querySelectorAll('.nav a').forEach(nav => nav.classList.remove('active'));
    document.getElementById('nav-' + pageId).classList.add('active');

    if(pageId === 'master') {
        showCustomerList();
        if(!$.fn.DataTable.isDataTable('#customerTable')) {
            loadBranches();
            loadCustomers('ALL');
        }
    } else if (pageId === 'products') {
        loadProducts();
    }
}

function loadBranches() {
    fetch(API_URL + "?action=getBranches")
    .then(res => res.json())
    .then(branches => {
        const select = document.getElementById('branchFilter');
        branches.forEach(b => {
            select.innerHTML += `<option value="${b.branches}">${b.branches} (${b.branchCode})</option>`;
        });
    });
}

function loadCustomers(branch) {
    let url = API_URL + "?action=getCustomers";
    if(branch !== 'ALL') url += "&branch=" + encodeURIComponent(branch);

    document.querySelector('#customerTable tbody').innerHTML = '<tr><td colspan="5" class="text-center">डेटा लोड होत आहे...</td></tr>';

    fetch(url)
    .then(res => res.json())
    .then(data => {
        if ($.fn.DataTable.isDataTable('#customerTable')) {
            $('#customerTable').DataTable().destroy();
        }
        const tbody = document.querySelector('#customerTable tbody');
        tbody.innerHTML = '';

        data.forEach(cust => {
            if(cust.customerName) {
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cust.customerId || '-'}</td>
                    <td><b>${cust.customerName}</b></td>
                    <td>${cust.mobileNumber || '-'}</td>
                    <td>${cust.customerDistrict || '-'}</td>
                    <td><button class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick='showCustomerDetail(${JSON.stringify(cust).replace(/'/g, "&#39;")})'>View</button></td>
                `;
                tbody.appendChild(tr);
            }
        });

        $('#customerTable').DataTable({ 
            pageLength: 10,
            responsive: true,
            order: [[1, 'asc']]
        });
    });
}

function showCustomerDetail(cust) {
    document.getElementById('customerListView').style.display = 'none';
    document.getElementById('customerDetailView').style.display = 'block';

    // Map Headers to HTML
    document.getElementById('detailCustomerName').innerText = cust.customerName || '-';
    document.getElementById('detailCustomerId').innerText = 'ID: ' + (cust.customerId || '-');
    document.getElementById('detailAccount').innerText = 'A/c: ' + (cust.accountNumber || '-');
    
    document.getElementById('detailMobile').innerText = cust.mobileNumber || '-';
    document.getElementById('detailAadhar').innerText = cust.addharNo || '-';
    document.getElementById('detailPan').innerText = cust.panNo || '-';
    document.getElementById('detailDob').innerText = cust.dateOfBirth || '-';
    document.getElementById('detailLocation').innerText = (cust.customerDistrict || '') + ' / ' + (cust.customerTaluka || '');

    document.getElementById('detailDesignation').innerText = cust.jobDesignation || '-';
    document.getElementById('detailOrganisation').innerText = cust.organisationWorking || '-';
    document.getElementById('detailRetirement').innerText = cust.dateOfRetirement || '-';
    document.getElementById('detailYearsLeft').innerText = cust.yearRemainingForRetirement || '-';

    document.getElementById('detailHaveHome').innerText = cust.haveHome || '-';
    document.getElementById('detailVehicles').innerText = `Car: ${cust.haveCar || '-'} | Bike: ${cust.haveBike || '-'}`;
    document.getElementById('detailElectricCar').innerText = cust.haveElectricCar || '-';
    document.getElementById('detailSolar').innerText = cust.rooftopSolar || '-';

    // CRM Actions Update
    document.getElementById('btn-call').href = `tel:+91${cust.mobileNumber}`;
    document.getElementById('btn-sms').href = `sms:+91${cust.mobileNumber}`;
    let waMsg = encodeURIComponent(`नमस्कार ${cust.customerName},\nबँकेच्या नवीन योजनांसाठी आवश्यक कागदपत्रांची यादी...`);
    document.getElementById('btn-wa').href = `https://wa.me/91${cust.mobileNumber}?text=${waMsg}`;

    // Recommendations Logic Engine
    let recs = "";
    if(cust.haveCar && cust.haveCar.toString().toLowerCase() === "no") {
        recs += "<li>🚗 4 Wheeler Loan (Non-EV)</li>";
    }
    if(cust.haveElectricCar && cust.haveElectricCar.toString().toLowerCase() === "no") {
        recs += "<li>⚡ 4 Wheeler EV Loan</li>";
    }
    if(cust.haveHome && cust.haveHome.toString().toLowerCase() === "yes" && cust.rooftopSolar && cust.rooftopSolar.toString().toLowerCase() === "no") {
        recs += "<li>☀️ Solar Loan (घर स्वतःचे असल्यामुळे पात्र)</li>";
    }
    if(cust.haveHome && cust.haveHome.toString().toLowerCase() === "no") {
        recs += "<li>🏠 Housing Loan</li>";
    }
    if(recs === "") recs = "<li>सध्या कोणतीही विशिष्ट शिफारस नाही.</li>";
    
    document.getElementById('detailRecommendations').innerHTML = recs;
}

function showCustomerList() {
    document.getElementById('customerDetailView').style.display = 'none';
    document.getElementById('customerListView').style.display = 'block';
}

function downloadPDF() {
    const element = document.getElementById('printable-profile');
    const name = document.getElementById('detailCustomerName').innerText;
    html2pdf().set({
        margin: 0.5,
        filename: `${name}_Report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
}

let productsList = [];
function loadProducts() {
    if(productsList.length > 0) return; 
    
    fetch(API_URL + "?action=getProducts")
    .then(res => res.json())
    .then(data => {
        productsList = data;
        const container = document.getElementById("productChips");
        container.innerHTML = "";
        
        productsList.forEach((prod, index) => {
            let btn = document.createElement("button");
            btn.className = "product-chip";
            btn.style.padding = "10px 15px";
            btn.style.border = "1px solid var(--line)";
            btn.style.borderRadius = "8px";
            btn.style.background = "white";
            btn.style.cursor = "pointer";
            btn.innerText = prod.name;
            btn.onclick = () => renderProductDetails(index);
            container.appendChild(btn);
        });
        if(productsList.length > 0) renderProductDetails(0);
    });
}

function renderProductDetails(index) {
    const prod = productsList[index];
    document.querySelectorAll(".product-chip").forEach((chip, i) => {
        chip.style.background = (i === index) ? "var(--accent)" : "white";
        chip.style.color = (i === index) ? "white" : "black";
        chip.style.borderColor = (i === index) ? "var(--accent)" : "var(--line)";
    });

    const beforeHtml = prod.beforeDocs.map(d => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">✅ ${d}</li>`).join('');
    const afterHtml = prod.afterDocs.map(d => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">✅ ${d}</li>`).join('');

    document.getElementById("productDetails").innerHTML = `
        <h2 style="font-size:1.5rem; margin-bottom:10px;">${prod.name}</h2>
        <div style="display:inline-block; background:#ecfdf5; color:#0f766e; padding:5px 15px; border-radius:5px; font-weight:bold; margin-bottom:15px;">
            Rate of Interest: ${prod.roi}
        </div>
        <p style="color:#78716c; margin-bottom:20px;">${prod.description}</p>
        
        <div style="display:flex; gap:20px; flex-wrap:wrap; background:#f9fafb; padding:15px; border-radius:10px;">
            <div style="flex:1; min-width:250px;">
                <h4 style="color:#0f766e; margin-bottom:15px;">Before Loan Disbursal</h4>
                <ul style="list-style:none; padding:0; margin:0;">${beforeHtml || '<li>No documents</li>'}</ul>
            </div>
            <div style="flex:1; min-width:250px;">
                <h4 style="color:#0f766e; margin-bottom:15px;">After Loan Disbursal</h4>
                <ul style="list-style:none; padding:0; margin:0;">${afterHtml || '<li>No documents</li>'}</ul>
            </div>
        </div>
    `;
}

// PWA Service Worker Setups
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
