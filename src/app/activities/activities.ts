import { Component, OnInit } from '@angular/core';
import { Activity, ActivityService } from '../services/activity.service';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';


@Component({
  selector: 'app-activities',
  imports: [TitleCasePipe, FormsModule, CommonModule],
  templateUrl: './activities.html',
  styleUrl: './activities.css',
})
export class Activities implements OnInit {

  activities: Activity[] = [];
  filtered: Activity[] = [];
  selected = new Set<string>();
  search = '';

  constructor(private activityService: ActivityService) { }

  ngOnInit() {
    this.activityService.getActivities().subscribe(data => {
      this.activities = data.sort((a, b) => a.order - b.order);
      this.filtered = this.activities;
    });
  }

  toggle(id: string) {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = this.activities.filter(a =>
      a.name.toLowerCase().includes(q)
    );
  }

  byCategory(category: string) {
    return this.filtered.filter(a => a.category === category);
  }

  save() {
    console.log('Selected activities:', Array.from(this.selected));
    // TODO: persist to Firestore under user profile
  }
}

