// येथे तुमची नवीन Google Apps Script ची वेब लिंक टाका
const API_URL = "https://script.google.com/macros/s/AKfycbxP2mIjKw4cr3s4wq7Q7ZHtcMvjoY61TgC4yGhqeNZAwprw-aa88WrbV3k-WSRkfs9aqA/exec"; 

// --- 1. SPA Routing Logic ---
function showPage(pageId) {
    // सर्व पेजेस लपवा
    document.querySelectorAll('.app-page').forEach(page => page.style.display = 'none');
    // निवडलेले पेज दाखवा
    document.getElementById('page-' + pageId).style.display = 'block';
    
    // नेव्हिगेशन मेनू ऍक्टिव्ह करा
    document.querySelectorAll('.nav a').forEach(nav => nav.classList.remove('active'));
    document.getElementById('nav-' + pageId).classList.add('active');

    // पेज नुसार डेटा लोड करा
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

// --- 2. Customer Master Logic ---
function loadBranches() {
    fetch(API_URL + "?action=getBranches")
    .then(res => res.json())
    .then(branches => {
        const select = document.getElementById('branchFilter');
        branches.forEach(b => {
            select.innerHTML += `<option value="${b.branches}">${b.branches}</option>`;
        });
    });
}

function loadCustomers(branch) {
    let url = API_URL + "?action=getCustomers";
    if(branch !== 'ALL') url += "&branch=" + encodeURIComponent(branch);

    fetch(url)
    .then(res => res.json())
    .then(data => {
        if ($.fn.DataTable.isDataTable('#customerTable')) {
            $('#customerTable').DataTable().destroy();
        }
        const tbody = document.querySelector('#customerTable tbody');
        tbody.innerHTML = '';

        data.forEach(cust => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cust.customerId || '-'}</td>
                <td>${cust.customerName || '-'}</td>
                <td>${cust.mobileNumber || '-'}</td>
                <td><button class="btn btn-sm" style="background:var(--accent); color:white;" onclick='showCustomerDetail(${JSON.stringify(cust)})'>View</button></td>
            `;
            tbody.appendChild(tr);
        });

        $('#customerTable').DataTable({ pageLength: 10 });
    });
}

function showCustomerDetail(cust) {
    document.getElementById('customerListView').style.display = 'none';
    document.getElementById('customerDetailView').style.display = 'block';

    document.getElementById('detailCustomerName').innerText = cust.customerName || '-';
    document.getElementById('detailCustomerId').innerText = cust.customerId || '-';
    document.getElementById('detailMobile').innerText = cust.mobileNumber || '-';
    document.getElementById('detailAadhar').innerText = cust.addharNo || '-';
    document.getElementById('detailPan').innerText = cust.panNo || '-';
    // तुम्ही HTML मध्ये बनवलेल्या इतर सर्व fields इथे मॅप करा.
}

function showCustomerList() {
    document.getElementById('customerDetailView').style.display = 'none';
    document.getElementById('customerListView').style.display = 'block';
}

// --- 3. Products Logic ---
let productsList = [];
function loadProducts() {
    if(productsList.length > 0) return; // आधीच लोड केले असल्यास पुन्हा नको
    
    fetch(API_URL + "?action=getProducts")
    .then(res => res.json())
    .then(data => {
        productsList = data;
        const container = document.getElementById("productChips");
        container.innerHTML = "";
        
        productsList.forEach((prod, index) => {
            let btn = document.createElement("button");
            btn.className = "product-chip";
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
    });

    const beforeHtml = prod.beforeDocs.map(d => `<li>${d}</li>`).join('');
    const afterHtml = prod.afterDocs.map(d => `<li>${d}</li>`).join('');

    document.getElementById("productDetails").innerHTML = `
        <h2>${prod.name}</h2>
        <div class="product-roi">ROI: ${prod.roi}</div>
        <p>${prod.description}</p>
        <hr>
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <div style="flex:1; min-width:250px;">
                <h4>Before Disbursal</h4>
                <ul>${beforeHtml || '<li>No documents</li>'}</ul>
            </div>
            <div style="flex:1; min-width:250px;">
                <h4>After Disbursal</h4>
                <ul>${afterHtml || '<li>No documents</li>'}</ul>
            </div>
        </div>
    `;
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
