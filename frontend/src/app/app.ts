import { Component, signal } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { CadastroPessoa } from './pessoas/cadastro-pessoa/cadastro-pessoa';

@Component({
  imports: [CadastroPessoa],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Jornada Imobiliária');
}
