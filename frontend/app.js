const API_URL = "http://127.0.0.1:3000/api";

function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function showMessage(id, text, type = "success") {
  const box = document.getElementById(id);
  if (!box) return;
  box.className = `message ${type}`;
  box.textContent = text;
}

async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json"
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}