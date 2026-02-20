async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
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
      "Authorization": "Bearer " + token
  },
    body: JSON.stringify({
      numero: numero
  })
})

  const data = await res.json();
  document.getElementById("resultado").innerText =
    data.success ? "Ligação solicitada" : "Erro ao ligar";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}
async function salvarRamal() {
  const ramal = document.getElementById("ramal").value;
  const token = localStorage.getItem("token");

  const res = await fetch("/api/me/ramal", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ ramal })
  });

  const data = await res.json();
  alert(data.message || data.error);
}
async function ligar() {
  const destino = document.getElementById("destino").value;
  const token = localStorage.getItem("token");

  const res = await fetch("/api/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ numero: destino })
  });

  const data = await res.json();
  console.log(data);
  alert(data.error || "Chamada enviada!");
}
async function carregarHistorico() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/my-calls", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const calls = await res.json();

  const div = document.getElementById("historico");
  div.innerHTML = "";

  calls.forEach(call => {
    div.innerHTML += `
      <p>
        ${call.created_at} |
        Ramal: ${call.ramal} |
        Número: ${call.numero_externo} |
        Status: ${call.status}
      </p>
    `;
  });
}
