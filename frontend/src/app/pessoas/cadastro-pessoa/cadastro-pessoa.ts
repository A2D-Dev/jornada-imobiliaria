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
  protected readonly cpf = signal('');
  protected readonly cnpj = signal('');
  protected readonly erroCampoDocumento = signal('');
  protected readonly abaSelecionada = signal('identificacao');
  protected readonly email = signal('');
  protected readonly erroCampoEmail = signal('');
  
  protected readonly pendenciasIdentificacao = computed(() => {
    let pendencias = 0;

    if (this.nome() === '') {
      pendencias++;
    }

    if (this.tipoPessoa() === 'PF') {
      if (this.cpf() === '' || !this.validarCpf(this.cpf())) {
        pendencias++;
      }
    }
    else if (this.tipoPessoa() === 'PJ') {
      if (this.cnpj() === '' || !this.validarCnpj(this.cnpj())) {
        pendencias++;
      }
    }

    return pendencias;
  });

  protected readonly pendenciasContatos = computed(() => {
    let pendencias = 0;

    if (!this.validarEmail(this.email())) {
      pendencias++;
    }
    return pendencias;
  });

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

  limparCnpj(documento: string): string {
    let cnpjLimpo = '';

    // Padroniza as letras antes da limpeza.
    documento = documento.toUpperCase();

    for (let i = 0; i < documento.length; i++) {
      if (
        (
          (documento[i] >= 'A' && documento[i] <= 'Z') ||
          (documento[i] >= '0' && documento[i] <= '9')
        ) &&
        cnpjLimpo.length < 14
      ) {
        cnpjLimpo += documento[i];
      }
    }

    return cnpjLimpo;
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

  formatarCnpj(documento: string): string {
    let cnpjLimpo = this.limparCnpj(documento);
    let cnpjFormatado = '';

    for (let i = 0; i < cnpjLimpo.length; i++) {
      if (i === 2 || i === 5) {
        cnpjFormatado += '.';
      } else if (i === 8) {
        cnpjFormatado += '/';
      } else if (i === 12) {
        cnpjFormatado += '-';
      }

      cnpjFormatado += cnpjLimpo[i];
    }

    return cnpjFormatado;
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
    // 1. Identifica o campo HTML e seu conteúdo.
    const campo = evento.target as HTMLInputElement;
    const textoDigitado = campo.value;
    const ehPessoaFisica = this.tipoPessoa() === 'PF';

    // 2. Guarda a posição atual do cursor.
    const posicaoCursor = campo.selectionStart ?? textoDigitado.length;

    // 3. Conta os caracteres válidos antes do cursor.
    let caracteresAntesCursor = 0;

    for (let i = 0; i < posicaoCursor; i++) {
      const caractere = textoDigitado[i].toUpperCase();

      const ehNumero = caractere >= '0' && caractere <= '9';
      const ehLetra = caractere >= 'A' && caractere <= 'Z';

      if (ehNumero || (!ehPessoaFisica && ehLetra)) {
        caracteresAntesCursor++;
      }
    }

    // 4. Escolhe a limpeza conforme o tipo de pessoa.
    const documentoLimpo = ehPessoaFisica
      ? this.limparCpf(textoDigitado)
      : this.limparCnpj(textoDigitado);

    // 5. Atualiza o Signal com o documento sem máscara.
    if (ehPessoaFisica) {
      this.cpf.set(documentoLimpo);
    } else {
      this.cnpj.set(documentoLimpo);
    }

    // 6. Escolhe a máscara correspondente.
    const documentoFormatado = ehPessoaFisica
      ? this.formatarCpf(documentoLimpo)
      : this.formatarCnpj(documentoLimpo);

    // 7. Atualiza o texto visível no campo HTML.
    campo.value = documentoFormatado;

    // 8. Localiza a nova posição do cursor.
    let novaPosicao = 0;
    let caracteresEncontrados = 0;

    if (caracteresAntesCursor > 0) {
      for (let i = 0; i < documentoFormatado.length; i++) {
        const caractere = documentoFormatado[i].toUpperCase();

        const ehNumero = caractere >= '0' && caractere <= '9';
        const ehLetra = caractere >= 'A' && caractere <= 'Z';

        if (ehNumero || (!ehPessoaFisica && ehLetra)) {
          caracteresEncontrados++;
        }

        novaPosicao = i + 1;

        if (caracteresEncontrados >= caracteresAntesCursor) {
          break;
        }
      }
    }

    // 9. Reposiciona o cursor.
    campo.setSelectionRange(novaPosicao, novaPosicao);

    // 10. Limpa a mensagem de erro anterior.
    this.erroCampoDocumento.set('');
  }


  validarDocumento() {
    if (this.tipoPessoa() === 'PF') {
      const cpf = this.cpf();

      if (cpf === '') {
        this.erroCampoDocumento.set('Informe o CPF');
      } else if (cpf.length !== 11) {
        this.erroCampoDocumento.set('O CPF deve conter 11 dígitos.');
      } else if (!this.validarCpf(cpf)) {
        this.erroCampoDocumento.set('CPF inválido. Verifique o número informado.');
      } else {
        this.erroCampoDocumento.set('');
      }

    } else if (this.tipoPessoa() === 'PJ') {
      const cnpj = this.cnpj();

      if (cnpj === '') {
        this.erroCampoDocumento.set('Informe o CNPJ');
      } else if (cnpj.length !== 14) {
        this.erroCampoDocumento.set('O CNPJ deve conter 14 caracteres.');
      } else if (!this.validarCnpj(cnpj)) {
        this.erroCampoDocumento.set('CNPJ inválido. Verifique o documento informado.');
      } else {
        this.erroCampoDocumento.set('');
      }
    }
  }

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

  validarCnpj(cnpj: string): boolean {
    // 1. Padroniza as letras para maiúsculas.
    cnpj = cnpj.toUpperCase();

    // 2. Verifica o comprimento do CNPJ.
    if (cnpj.length !== 14) {
      return false;
    }

    // 3. Verifica as primeiras 12 posições.
    // Aceita letras de A a Z e números de 0 a 9.
    for (let i = 0; i < 12; i++) {
      const ehLetra = cnpj[i] >= 'A' && cnpj[i] <= 'Z';
      const ehNumero = cnpj[i] >= '0' && cnpj[i] <= '9';

      if (!ehLetra && !ehNumero) {
        return false;
      }
    }

    // 4. Os dois últimos caracteres devem ser números.
    for (let i = 12; i < 14; i++) {
      if (cnpj[i] < '0' || cnpj[i] > '9') {
        return false;
      }
    }

    // 5. Rejeita documentos com todos os caracteres iguais.
    let todosIguais = true;

    for (let i = 1; i < cnpj.length; i++) {
      if (cnpj[i] !== cnpj[0]) {
        todosIguais = false;
        break;
      }
    }

    if (todosIguais) {
      return false;
    }

    // 6. Calcula o primeiro dígito verificador.
    const pesosPrimeiroDigito = [
      5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
    ];

    let soma = 0;

    for (let i = 0; i < 12; i++) {
      const valor = cnpj[i].charCodeAt(0) - 48;
      const peso = pesosPrimeiroDigito[i];

      soma += valor * peso;
    }

    let resto = soma % 11;
    let primeiroDigito = 0;

    if (resto > 1) {
      primeiroDigito = 11 - resto;
    }

    if (Number(cnpj[12]) !== primeiroDigito) {
      return false;
    }

    // 7. Calcula o segundo dígito verificador.
    const pesosSegundoDigito = [
      6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
    ];

    soma = 0;

    for (let i = 0; i < 13; i++) {
      const valor = cnpj[i].charCodeAt(0) - 48;
      const peso = pesosSegundoDigito[i];

      soma += valor * peso;
    }

    resto = soma % 11;
    let segundoDigito = 0;

    if (resto > 1) {
      segundoDigito = 11 - resto;
    }

    if (Number(cnpj[13]) !== segundoDigito) {
      return false;
    }

    // 8. Todos os testes foram aprovados.
    return true;
  }

  validarEmail(email: string): boolean {
    // Remove espaços das extremidades.
    const emailLimpo = email.trim();

    // Rejeita um e-mail vazio.
    if (emailLimpo === '') {
      return false;
    }

    const partes = emailLimpo.split('@');

    if (partes.length !== 2 || !partes[1].includes('.')) {
      return false;
    }

    // Cria um campo temporário para validar o formato.
    const campo = document.createElement('input');
    campo.type = 'email';
    campo.value = emailLimpo;

    // Devolve o resultado da validação do navegador.
    return campo.validity.valid;
  }

  validarCampoEmail() {
    if (this.email().trim() === '') {
      this.erroCampoEmail.set('Informe o e-mail.');
    } else if (!this.validarEmail(this.email())) {
      this.erroCampoEmail.set('E-mail inválido. Verifique o endereço informado.');
    } else {
      this.erroCampoEmail.set('');
    }
  }
}
