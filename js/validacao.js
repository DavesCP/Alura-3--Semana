export function valida(input) {
    const tipoDeInput = input.dataset.tipo

    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input)
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    senha: {
        valueMissing: 'O campo senha não pode estar vazio.',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.'
    },
    dataNascimento: {
        valueMissing: 'O campo data de nascimento não pode estar vazio.',
        customError: 'Você deve ser maior que 18 anos para se cadastrar.'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio.',
        customError: 'O CPF digitado não é válido.' 
    },
    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'Não foi possível buscar o CEP.'
    },
    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo de estado não pode estar vazio.'
    }
}

const validadores = {
    dataNascimento:input => validaDataNascimento(input),
    cpf:input => validaCPF(input),
    cep:input => recuperarCEP(input)
}

function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = ''
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]
        }
    })
    
    return mensagem
}

function validaDataNascimento(input) {
    const dataRecebida = new Date(input.value)
    let mensagem = ''

    if(!maiorQue18(dataRecebida)) {
        mensagem = 'Você deve ser maior que 18 anos para se cadastrar.'
    }

    input.setCustomValidity(mensagem)
}

function maiorQue18(data) {
    const dataAtual = new Date()
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())
    console.log("Data + 18: " + dataMais18)

    return dataMais18 <= dataAtual
}

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/[^\d]/g, ''); //remover digitos não numéricos
    console.log(cpfFormatado)
    let mensagem = ''

    if(!verificarQuantidadeCaracteres(cpfFormatado) || !verificarEstruturaComDigitos(cpfFormatado)){
        mensagem = "O CPF digitado não é válido!"
    }

    input.setCustomValidity(mensagem)
}

function verificarQuantidadeCaracteres(cpfFormatado){
    if (cpfFormatado.length !== 11){
        return false
    } else{
        return true
    }
}

function verificarEstruturaComDigitos(cpfFormatado) {
  
    // Multiplicar todos os digitos do cpfFormatado pelos pesos correspondentes e fazer a soma
    var soma = 0;
    var peso = 10;
    for (var i = 0; i < 9; i++) {
      soma += parseInt(cpfFormatado.charAt(i)) * peso--;
    }
  
    // Caso o resultado da soma seja divisivel por 11, está válido
    var digito = 11 - (soma % 11);
    if (digito === 10 || digito === 11) {
      digito = 0;
    }
    if (digito !== parseInt(cpfFormatado.charAt(9))) {
      return false;
    }
  
/*  Caso o resultado da soma não seja divisivel por 11,
        verificar se o digito verificador é igual ao resto da divisão por 11
    Caso seja 10, o digito verificador deve ser 0 */

    soma = 0;
    peso = 11;
    for (var i = 0; i < 10; i++) {
      soma += parseInt(cpfFormatado.charAt(i)) * peso--;
    }
    digito = 11 - (soma % 11);
    if (digito === 10 || digito === 11) {
      digito = 0;
    }
    if (digito !== parseInt(cpfFormatado.charAt(10))) {
      return false;
    }

    return true;
  }
  
function recuperarCEP(input) {
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json/`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url,options).then(
            response => response.json()
        ).then(
            data => {
                if(data.erro) {
                    input.setCustomValidity('Não foi possível buscar o CEP.')
                    return
                }
                input.setCustomValidity('')
                preencheCamposComCEP(data)
                return
            }
        )
    }
}

function preencheCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}
