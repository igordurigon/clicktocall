const API = "/api";

async function login() {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      senha: senha.value
    })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    window.location = "dashboard.html";
  } else {
    alert(data.error);
  }
}

async function ligar() {
  const res = await fetch(API + "/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ destino: destino.value })
  });

  const data = await res.json();
  resultado.innerText = data.success ? "Ligação solicitada" : "Erro";
}

async function atualizarRamal() {
  await fetch(API + "/user/ramal", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ ramal: ramal.value })
  });
  alert("Ramal atualizado");
}

async function trocarSenha() {
  const res = await fetch(API + "/user/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      senhaAtual: senhaAtual.value,
      novaSenha: novaSenha.value
    })
  });

  const data = await res.json();
  alert(data.success ? "Senha alterada" : data.error);
}

function logout() {
  localStorage.clear();
  window.location = "index.html";
}