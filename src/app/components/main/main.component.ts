import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderComponent } from './header/header.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadComponent } from './thread/thread.component';

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, ChatComponent, ThreadComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  authService = inject(AuthService);
}
