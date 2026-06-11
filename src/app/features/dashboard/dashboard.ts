import { Component } from '@angular/core';
import { Chat } from "../../chat/chat";

@Component({
  selector: 'app-dashboard',
  imports: [Chat],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {}
