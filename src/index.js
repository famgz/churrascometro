let cadastro = carregarLocalStorage();

const formCadastro = document.getElementById('form-cadastro');
const inputNome = document.getElementById('input-nome');
const inputEmail = document.getElementById('input-email');
const inputCep = document.getElementById('input-cep');
const inputPromos = document.getElementById('input-receber-promos');
const btnCadastroSubmit = document.getElementById('btn-cadastro-submit');
const btnCadastroReset = document.getElementById('btn-cadastro-reset');
const btnCadastroRemover = document.getElementById('icone-remover');

const formParticipantes = document.getElementById('form-participantes');
const inputPartHomens = document.getElementById('input-part-h');
const inputPartMulheres = document.getElementById('input-part-m');
const inputPartCriancas = document.getElementById('input-part-c');
const inputPartBebemAlcool = document.getElementById('input-part-ba');
const btnPartSubmit = document.getElementById('btn-part-submit');
const btnPartReset = document.getElementById('btn-part-reset');

const tabelaQuantitativos = document.getElementById('quantitativos');
const resultados = document.getElementById('resultados');

const loadingIntervalInMs = 1000;

function salvarLocalStorage() {
  localStorage.setItem('churrascometro', JSON.stringify(cadastro));
}

function carregarLocalStorage() {
  return JSON.parse(localStorage.getItem('churrascometro'));
}

function checarCadastro() {
  if (!cadastro) {
    return;
  }
  inputNome.disabled = true;
  inputNome.value = cadastro.nome;

  inputEmail.disabled = true;
  inputEmail.value = cadastro.email;

  inputCep.disabled = true;
  inputCep.value = cadastro.cep;

  inputPromos.disabled = true;
  inputPromos.value = cadastro.receberPromos;

  btnCadastroSubmit.disabled = true;
  btnCadastroSubmit.style.cursor = 'not-allowed';
  btnCadastroSubmit.classList.add('btn-dark-disabled');
  btnCadastroSubmit.removeEventListener('click', handleCadastroSubmit);

  btnCadastroReset.disabled = true;
  btnCadastroReset.style.cursor = 'not-allowed';
  btnCadastroReset.classList.add('btn-light-disabled');

  formCadastro.style.backgroundColor = '#f5f5f5';

  inserirSucesso('cadastro');

  inputPartHomens.focus();
}

function validarCEP(cep) {
  var regexCEP = /^[0-9]{5}-[0-9]{3}$/;
  return regexCEP.test(cep);
}

function validarEmail(email) {
  var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

function obterInputsCadastro() {
  const nome = inputNome.value.trim();
  const email = inputEmail.value.trim();
  const cep = inputCep.value.trim();
  const receberPromos = inputPromos.checked;

  if (!(nome && email && cep)) {
    alert('Todos os campos deve ser preenchidos');
    return;
  }

  if (!validarEmail(email)) {
    alert('Email inválido');
    return;
  }

  if (!validarCEP(cep)) {
    alert('CEP inválido');
    return;
  }

  return { nome, email, cep, receberPromos };
}

function salvarCadastro({ nome, email, cep, receberPromos }) {
  const nomeOuEmailExiste = cadastro?.find(
    (c) => c.nome === nome || c.email === email
  );

  if (nomeOuEmailExiste) {
    alert('Nome ou email já cadastrados');
    return;
  }

  const obj = {
    nome,
    email,
    cep,
    receberPromos,
  };

  cadastro = obj;
  console.log(cadastro);
  salvarLocalStorage();
}

function obterItens() {
  const homens = parseInt(inputPartHomens.value);
  const mulheres = parseInt(inputPartMulheres.value);
  const criancas = parseInt(inputPartCriancas.value);
  let bebemAlcool = parseInt(inputPartBebemAlcool.value);

  if (!(homens || mulheres)) {
    return;
  }

  return { homens, mulheres, criancas, bebemAlcool };
}

function calcularItens({ homens, mulheres, criancas, bebemAlcool }) {
  const adultos = homens + mulheres;
  const pessoas = homens + mulheres + criancas;

  bebemAlcool = Math.min(adultos, bebemAlcool);

  const itens = [
    {
      item: 'Carne',
      unidade: 'Kg',
      qtde: (0.4 * homens + 0.32 * mulheres + 0.2 * criancas).toFixed(2),
    },
    {
      item: 'Pão de alho',
      unidade: 'Unidade',
      qtde: 2 * adultos + 1 * criancas,
    },
    { item: 'Carvão', unidade: 'Kg', qtde: 1 * pessoas },
    { item: 'Sal', unidade: 'g', qtde: 4 * pessoas },
    { item: 'Gelo', unidade: 'Saco 5Kg', qtde: 5 * Math.floor(pessoas / 10) },
    {
      item: 'Refrigerante',
      unidade: 'Garrafa 2L',
      qtde: 1 * Math.floor(pessoas / 5),
    },
    { item: 'Água', unidade: 'Garrafa 1L', qtde: 1 * Math.floor(pessoas / 5) },
    { item: 'Cerveja', unidade: 'Garrafa 600ml', qtde: 3 * adultos },
  ];

  resultados.innerHTML = '';

  for ({ item, unidade, qtde } of itens) {
    resultados.insertAdjacentHTML(
      'beforeend',
      `
    <tr>
        <td>${item}</td>
        <td>${qtde}</td>
        <td>${unidade}</td>
    </tr>
    `
    );
  }
}

function inserirSucesso(type) {
  let status;
  if (type === 'cadastro') {
    status = formCadastro.querySelector('.status-wrapper');
    status.innerHTML = 'Cadastro realizado com sucesso! ✅';
  } else {
    status = formParticipantes.querySelector('.status-wrapper');
    status.innerHTML = 'Cálculo realizado com sucesso! ✅';
  }
}

function inserirSpinner(type) {
  let status;
  if (type === 'cadastro') {
    status = formCadastro.querySelector('.status-wrapper');
  } else {
    status = formParticipantes.querySelector('.status-wrapper');
  }
  status.innerHTML = '<div class="spinner"></div>';
}

function limparStatus(type) {
  let status;
  if (type === 'cadastro') {
    status = formCadastro.querySelector('.status-wrapper');
  } else {
    status = formParticipantes.querySelector('.status-wrapper');
  }
  status.innerHTML = '';
}

async function handleCadastroSubmit() {
  const dadosInput = obterInputsCadastro();
  if (!dadosInput) {
    return;
  }
  inserirSpinner('cadastro');
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        salvarCadastro(dadosInput);
        checarCadastro();
        resolve('Cadastro concluído');
        inserirSucesso('cadastro');
      }, loadingIntervalInMs);
    } catch (err) {
      console.error(err.message);
    }
  });
}

async function handleParticipantesSubmit() {
  if (!cadastro) {
    inputNome.focus();
    alert('É necessário concluir o cadastro antes!');
    return;
  }
  const itens = obterItens();
  if (!itens) {
    alert('É necessário escolher ao menos 1 participante adulto');
    return;
  }
  inserirSpinner('participantes');
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        calcularItens(itens);
        resolve('Calculo executado com sucesso!');
        inserirSucesso('participantes');
      }, loadingIntervalInMs);
    } catch (err) {
      console.error(err.message);
    }
  });
}

// Submeter cadastro
btnCadastroSubmit.addEventListener('click', async (ev) => {
  ev.preventDefault();
  try {
    await handleCadastroSubmit();
  } catch (err) {
    console.error(err.message);
  }
});

// Remover cadastro
btnCadastroRemover.addEventListener('click', () => {
  if (!cadastro) {
    return;
  }
  localStorage.removeItem('churrascometro');
  location.reload();
});

// Realizar calculo
btnPartSubmit.addEventListener('click', async () => {
  try {
    await handleParticipantesSubmit();
  } catch (err) {
    console.error(err.message);
  }
});

// Limpar campos participantes
btnPartReset.addEventListener('click', () => {
  limparStatus('participantes');
  resultados.innerHTML = '';
});

checarCadastro();
