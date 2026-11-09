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
      if (this.documento() === '' || this.documento().length !== 11) {
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

  atualizarDocumento(documento: string) {
    this.documento.set(documento);
    this.erroCampoDocumento.set('');
  }

  validarDocumento() {
    if (this.tipoPessoa() === 'PF') {
      if (this.documento() === ''){
        this.erroCampoDocumento.set('Informe o CPF');      
      }
      else if (this.documento().length !== 11) {
        this.erroCampoDocumento.set('O CPF deve conter 11 dígitos.');
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
