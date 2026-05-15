import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { DeviceService } from './services/device.service';
import { AppMode, DeviceType } from './app.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'lifestyle-adapter';
  router = inject(Router);

  constructor(public ds: DeviceService) {

  }

  ngOnInit() {
    window.addEventListener('DOMContentLoaded', () => {
      // Log launch display mode to analytics
      console.log('Device: ', this.ds.device);
    });
  }


}
