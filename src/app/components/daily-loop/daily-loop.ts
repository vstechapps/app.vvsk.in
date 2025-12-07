import { Component, OnInit } from '@angular/core';

interface Habit {
  id: string;
  name: string;
  status: 'pending' | 'done' | 'skipped';
}

@Component({
  selector: 'app-daily-loop',
  standalone: true,
  imports: [],
  templateUrl: './daily-loop.html',
  styleUrl: './daily-loop.css',
})
export class DailyLoop implements OnInit {
  habits: Habit[] = [
    { id: "h1", name: "Hydration (8 glasses)", status: "pending" },
    { id: "h2", name: "Morning Walk - 20m", status: "pending" },
    { id: "h3", name: "Meditation - 10m", status: "pending" }
  ];

  ngOnInit() {
    const saved = localStorage.getItem('la_habits');
    if (saved) {
      try {
        this.habits = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load habits', e);
      }
    }
  }

  get progressPercentage(): number {
    const total = this.habits.length;
    if (total === 0) return 0;
    const done = this.habits.filter(h => h.status === 'done').length;
    return Math.round((done / total) * 100);
  }

  toggleDone(habit: Habit) {
    habit.status = habit.status === 'done' ? 'pending' : 'done';
    this.save();
  }

  toggleSkip(habit: Habit) {
    habit.status = habit.status === 'skipped' ? 'pending' : 'skipped';
    this.save();
  }

  private save() {
    localStorage.setItem('la_habits', JSON.stringify(this.habits));
  }
}
