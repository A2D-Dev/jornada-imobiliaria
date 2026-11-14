import { Component, computed,signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-cadastro-pessoa',
  styleUrl: './cadastro-pessoa.css',
  templateUrl: './cadastro-pessoa.html',
})
export class CadastroPessoa {
  protected readonly tipoPessoa = signal('PF');
  protected readonly nome = signal('');
  protected readonly documento = signal('');
  protected readonly erroCampoDocumento = signal('');
  protected readonly abaSelecionada = signal('identificacao');
  protected readonly email = signal('');
  
  protected readonly pendenciasIdentificacao = computed(() => {
    let pendencias = 0;

    if (this.nome() === '') {
      pendencias++;
    }

    if (this.tipoPessoa() === 'PF') {
      if (this.documento() === '' || !this.validarCpf(this.documento())) {
        pendencias++;
      }
    }
    else if (this.tipoPessoa() === 'PJ') {
      if (this.documento() === '' || this.documento().length !== 14) {
        pendencias++;
      }
    }

    return pendencias;
  });

  protected readonly pendenciasContatos = computed(() => {
    let pendencias = 0;

    if (this.email() === '') {
      pendencias++;
    }
    return pendencias;
  });

  validarCpf(cpf: string): boolean {
    if (cpf.length !== 11) {
      return false;
    }

    for (let i = 0; i < cpf.length; i++) {
      if (cpf[i] < '0' || cpf[i] > '9') {
        return false;
      }
    }

    let todosIguais = true;

    for (let i = 1; i < cpf.length; i++) {
      if (cpf[0] !== cpf[i]) {
        todosIguais = false;
      }
    }

    if (todosIguais) {
      return false;
    }

    let soma = 0;
    let peso = 10;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * peso;
      peso--;
    }

    let resto = soma % 11;
    let primeiroDigito = 0;

    if (resto > 1) {
      primeiroDigito = 11 - resto;
    }

    if (Number(cpf[9]) !== primeiroDigito) {
      return false;
    }

    soma = 0;
    peso = 11;

    for (let i = 0; i < 10; i++){
      soma += Number(cpf[i]) * peso;
      peso--;
    }

    resto = soma % 11;

    let segundoDigito = 0;

    if (resto > 1) {
      segundoDigito = 11 - resto;
    }

    if (Number(cpf[10]) !== segundoDigito) {
      return false;
    }

    return true
  }

  limparCpf(documento: string): string {
    let cpfLimpo = '';

    for (let i = 0; i < documento.length; i++) {
      if (
        documento[i] >= '0' &&
        documento[i] <= '9' &&
        cpfLimpo.length < 11
      ) {
        cpfLimpo += documento[i];
      }
    }

    return cpfLimpo;
  }

  formatarCpf(documento: string): string {
    // 1. Remove caracteres que não sejam números
    // e limita o CPF a 11 dígitos.
    let cpfLimpo = this.limparCpf(documento);

    // 2. Insere os pontos e o hífen.
    let cpfFormatado = '';

    for (let i = 0; i < cpfLimpo.length; i++) {
      if (i === 3 || i === 6) {
        cpfFormatado += '.';
      } else if (i === 9) {
        cpfFormatado += '-';
      }

      cpfFormatado += cpfLimpo[i];
    }

    // 3. Devolve o CPF formatado.
    return cpfFormatado;
  }

  selecionarPJ(){
    this.tipoPessoa.set('PJ');
    this.validarDocumento();
  }

  selecionarPF(){
    this.tipoPessoa.set('PF');
    this.validarDocumento();
  }  

  selecionarAba(aba : string){
    this.abaSelecionada.set(aba);
  }

 atualizarDocumento(evento: Event) {
  const campo = evento.target as HTMLInputElement;
  const textoDigitado = campo.value;

  if (this.tipoPessoa() === 'PF') {

    // Guarda a posição atual do cursor.
    const posicaoCursor = campo.selectionStart ?? textoDigitado.length;

    // Conta quantos números existem antes do cursor.
    let numerosAntesCursor = 0;

    for (let i = 0; i < posicaoCursor; i++) {
      if (textoDigitado[i] >= '0' && textoDigitado[i] <= '9') {
        numerosAntesCursor++;
      }
    }

    // Limpa o CPF e atualiza o Signal.
    const cpfLimpo = this.limparCpf(textoDigitado);
    this.documento.set(cpfLimpo);

    // Aplica a máscara diretamente no campo.
    const cpfFormatado = this.formatarCpf(cpfLimpo);
    campo.value = cpfFormatado;

    // Localiza a posição correspondente após a formatação.
    let novaPosicao = 0;
    let numerosEncontrados = 0;

    if (numerosAntesCursor > 0) {
      for (let i = 0; i < cpfFormatado.length; i++) {
        if (cpfFormatado[i] >= '0' && cpfFormatado[i] <= '9') {
          numerosEncontrados++;
        }

        novaPosicao = i + 1;

        if (numerosEncontrados >= numerosAntesCursor) {
          break;
        }
      }
    }

    // Reposiciona o cursor.
    campo.setSelectionRange(novaPosicao, novaPosicao);

  } else {
    // Mantém o comportamento atual do CNPJ.
    this.documento.set(textoDigitado);
  }

  this.erroCampoDocumento.set('');
}

  validarDocumento() {

    if (this.tipoPessoa() === 'PF') {
      if (this.documento() === ''){
        this.erroCampoDocumento.set('Informe o CPF');      
      }
      else if (!this.validarCpf(this.documento())) {
        this.erroCampoDocumento.set('CPF inválido. Verifique o número informado.');
      } 
      else
      {
        this.erroCampoDocumento.set('');
      }
    }
    else if (this.tipoPessoa() === 'PJ') {
      if (this.documento() === ''){
        this.erroCampoDocumento.set('Informe o CNPJ');      
      }
      else if (this.documento().length !== 14) {
        this.erroCampoDocumento.set('O CNPJ deve conter 14 dígitos.');
      } 
      else
      {
        this.erroCampoDocumento.set('');
      }
    }    
  }
}
