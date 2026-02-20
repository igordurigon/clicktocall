async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("msg").innerText = "Erro no login";
  }
}

async function ligar() {
  const destino = document.getElementById("destino").value;

  const res = await fetch("/api/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ destino })
  });

  const data = await res.json();
  document.getElementById("resultado").innerText =
    data.success ? "Ligação solicitada" : "Erro ao ligar";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}
