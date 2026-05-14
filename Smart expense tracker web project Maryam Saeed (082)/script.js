let expenses = [];
let myBudget = 0;
let myGoal = 0;
let chart;
let editIndex = -1;

function checkLocalStorage() {
    if(localStorage.getItem("expenses")) {
        expenses = JSON.parse(localStorage.getItem("expenses"));
        myBudget = +localStorage.getItem("budget") || 0;
        myGoal = +localStorage.getItem("goal") || 0;
        document.getElementById("notesBox").value = localStorage.getItem("notes") || "";
        document.getElementById("setBudgetInput").value = myBudget;
        document.getElementById("setGoalInput").value = myGoal;
    }
}

// 1. Toggle between Sign In and Sign Up
function toggleAuth() {
    const loginBox = document.getElementById("login");
    const signupBox = document.getElementById("signup");
    if (loginBox.style.display === "none") {
        loginBox.style.display = "block";
        signupBox.style.display = "none";
    } else {
        loginBox.style.display = "none";
        signupBox.style.display = "block";
    }
}

// 2. Sign Up Logic (Data ko localStorage mein save karna)
function signup() {
    const name = document.getElementById("newName").value;
    const user = document.getElementById("newUser").value;
    const pass = document.getElementById("newPass").value;

    if (name && user && pass) {
        // User ka data object mein save kiya
        const userData = { name, user, pass };
        localStorage.setItem("userAccount", JSON.stringify(userData));
        alert("Account Created Successfully! Now Sign In.");
        toggleAuth(); // Wapis login par le jao
    } else {
        alert("Please fill all fields!");
    }
}

// 3. Updated Login Logic (Data check karna)
function login() {
    const userInp = document.getElementById("user").value;
    const passInp = document.getElementById("pass").value;
    
    // LocalStorage se saved account uthana
    const savedAccount = JSON.parse(localStorage.getItem("userAccount"));

    if (savedAccount) {
        if (userInp === savedAccount.user && passInp === savedAccount.pass) {
            document.getElementById("auth-container").style.display = "none";
            document.getElementById("dash").style.display = "block";
            // Welcome message mein user ka naam dalna
            document.querySelector(".welcome-msg").innerText = `Hello, ${savedAccount.name}! ✨`;
            render();
        } else {
            alert("Invalid Username or Password!");
        }
    } else {
        alert("No account found. Please Sign Up first!");
    }
}

function logout() { location.reload(); }

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute("data-theme");
    body.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
    render(); 
}

function saveSettings() {
    myBudget = +document.getElementById("setBudgetInput").value;
    myGoal = +document.getElementById("setGoalInput").value;
    localStorage.setItem("budget", myBudget);
    localStorage.setItem("goal", myGoal);
    render();
}

function saveNote() {
    localStorage.setItem("notes", document.getElementById("notesBox").value);
    alert('Notes Saved!');
}

function addExpense() {
    let t = document.getElementById("title").value;
    let a = +document.getElementById("amount").value;
    let ty = document.getElementById("type").value;
    let d = new Date().toLocaleDateString();

    if (t && a) {
        if(editIndex === -1) {
            expenses.push({t, a, ty, d});
        } else {
            expenses[editIndex] = {t, a, ty, d: expenses[editIndex].d};
            editIndex = -1;
            document.getElementById("addBtn").innerText = "Add To List";
        }
        localStorage.setItem("expenses", JSON.stringify(expenses));
        document.getElementById("title").value = "";
        document.getElementById("amount").value = "";
        render();
    } else {
        alert("Title and amount are required!");
    }
}

function deleteExpense(index) {
    if(confirm("Remove this entry?")) {
        expenses.splice(index, 1);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        render();
    }
}

function editExpense(index) {
    let e = expenses[index];
    document.getElementById("title").value = e.t;
    document.getElementById("amount").value = e.a;
    document.getElementById("type").value = e.ty;
    document.getElementById("addBtn").innerText = "Update Entry";
    editIndex = index;
}

function animateValue(id, start, end) {
    let obj = document.getElementById(id);
    let current = start;
    let range = end - start;
    let increment = end > start ? Math.ceil(range/15) : Math.floor(range/15);
    if(range === 0) {
        obj.innerText = document.getElementById("currency").value + " " + end;
        return;
    }
    let timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            obj.innerText = document.getElementById("currency").value + " " + end;
            clearInterval(timer);
        } else {
            obj.innerText = document.getElementById("currency").value + " " + current;
        }
    }, 30);
}

const categoryIcons = {
    Food: "🍔", Travel: "🚗", Shopping: "🛍️", Bills: "💡", Health: "🏥", Education: "🎓", Rent: "🏠"
};

function render() {
    let currency = document.getElementById("currency").value;
    let total = 0;
    let filter = document.getElementById("searchBar").value.toLowerCase();
    let catFilter = document.getElementById("categoryFilter").value;
    let counts = {Food:0, Travel:0, Shopping:0, Bills:0, Health:0, Education:0, Rent:0};
    let html = "";

    let oldTotalValue = document.getElementById("dispTotal").innerText.split(' ');
    let oldTotal = parseInt(oldTotalValue[oldTotalValue.length-1]) || 0;

    expenses.forEach((e, index) => {
        if (e.t.toLowerCase().includes(filter) && (catFilter === "All" || e.ty === catFilter)) {
            total += e.a;
            counts[e.ty] += e.a;
            html += `<tr>
                <td style="border-radius:12px 0 0 12px">${e.d}</td>
                <td><strong>${e.t}</strong></td>
                <td>${categoryIcons[e.ty]} ${e.ty}</td>
                <td><strong style="color:#ff4da6">${currency} ${e.a}</strong></td>
                <td style="border-radius:0 12px 12px 0">
                    <i class="fa fa-edit" onclick="editExpense(${index})" style="cursor:pointer; color:#ffa500; margin-right:15px"></i>
                    <i class="fa fa-trash" onclick="deleteExpense(${index})" style="cursor:pointer; color:#ff4757"></i>
                </td>
            </tr>`;
        }
    });

    animateValue("dispTotal", oldTotal, total);
    document.getElementById("dispBudget").innerText = `${currency} ${myBudget}`;
    document.getElementById("dispGoal").innerText = `${currency} ${myGoal}`;
    document.getElementById("historyBody").innerHTML = html;

    if (myBudget > 0) {
        let per = (total / myBudget) * 100;
        document.getElementById("progFill").style.width = Math.min(per, 100) + "%";
        document.getElementById("progText").innerText = `Usage: ${per.toFixed(1)}%`;
        document.getElementById("warning").style.display = total > myBudget ? "block" : "none";
    }
    updateChart(counts);
}

function updateChart(counts) {
    let ctx = document.getElementById("chart").getContext("2d");
    if (chart) chart.destroy();
    
    const labels = Object.keys(counts);
    const dataValues = Object.values(counts);
    const isDark = document.body.getAttribute("data-theme") !== "light";

    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#ff4da6', '#6a5acd', '#00c6ff', '#ffa500', '#00ff88', '#ffcc00', '#9999ff'],
                borderWidth: 1,
                borderColor: isDark ? '#ffffff' : '#f5f7fa'
            }]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#ffffff' : '#1a1a1a',
                        padding: 10,
                        font: { size: 10 }
                    }
                } 
            } 
        }
    });
}

function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.start();
    recognition.onresult = (e) => { document.getElementById("title").value = e.results[0][0].transcript; };
}

function startScanner() {
    let v = document.getElementById("videoElement");
    v.style.display = "block";
    document.getElementById("captureBtn").style.display = "block";
    navigator.mediaDevices.getUserMedia({video: true}).then(s => v.srcObject = s);
}

function capture() {
    document.getElementById("title").value = "Auto Scan #" + Math.floor(Math.random()*100);
    document.getElementById("amount").value = Math.floor(Math.random()*1000);
    alert("Scan successful!");
}

function previewMedia() {
    let f = document.getElementById("media").files[0];
    if (f) {
        let url = URL.createObjectURL(f);
        document.getElementById("preview").innerHTML = f.type.includes("image") ? `<img src="${url}" style="width:100%">` : `<video src="${url}" controls style="width:100%"></video>`;
    }
}

function askAI() {
    let total = expenses.reduce((sum, e) => sum + e.a, 0);
    let reply = document.getElementById("aiReply");
    if (total === 0) reply.innerText = "Add data first!";
    else if (myBudget > 0 && total > myBudget) reply.innerText = "🚨 STOP! You are overspending. Cancel non-essential items.";
    else reply.innerText = "✅ Excellent control. You're on track to hit your savings goal.";
}

function downloadReport() {
    let content = `EXPENSE REPORT\nTotal: ${expenses.reduce((s,e)=>s+e.a,0)}\n`;
    expenses.forEach(e => content += `${e.d}: ${e.t} - ${e.a}\n`);
    let blob = new Blob([content], {type: "text/plain"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Report.txt";
    a.click();
}