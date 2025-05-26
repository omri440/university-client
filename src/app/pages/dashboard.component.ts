import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';

import { StudentFormComponent } from "./student-form/student-form.component";
import { NavbarComponent } from "../components/navbar/navbar.component";

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StudentFormComponent,
    NavbarComponent,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public auth = inject(AuthService);
  private http = inject(HttpClient);
  public currentUser$ = this.auth.currentUser$;

  statsCards: { title: string; value: number; icon: string; color: string }[] = [];
  welcomeMessage = '';
  quickActions: string[] = [];
  students: any[] = [];
  recentActivity: string[] = [
    'System connected and ready',
    'Welcome to UniPortal',
    'Check navigation for your available features',
  ];

  allData = {
    students: [] as any[],
    lecturers: [] as any[],
    courses: [] as any[],
  };

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(wrapper => {
      const user = wrapper?.user;
      if (!user?.role || !user?.id) return;

      this.loadStats(user.role, user.id);
      this.welcomeMessage = this.getWelcomeMessage(user.role);
      this.quickActions = this.getQuickActions(user.role);
    });
  }

  private getWelcomeMessage(role: string): string {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Welcome to the University Management System. You can manage students, lecturers, courses, and more.';
      case 'LECTURER':
        return 'Welcome to your lecturer dashboard. Manage your courses and exams.';
      case 'STUDENT':
        return 'Welcome to your student portal. View your grades and courses.';
      default:
        return 'Welcome to UniPortal.';
    }
  }

  private getQuickActions(role: string): string[] {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return [
          'View and manage all students',
          'Create and edit courses',
          'Monitor exam schedules',
          'Review grade reports',
        ];
      case 'LECTURER':
        return [
          'Manage your courses',
          'Create and schedule exams',
          'Grade student submissions',
          'View student enrollment',
        ];
      case 'STUDENT':
        return [
          'View enrolled courses',
          'Check your grades',
          'View exam schedules',
          'Track academic progress',
        ];
      default:
        return [];
    }
  }

  reloadStats(): void {
    this.auth.currentUser$.pipe(take(1)).subscribe(wrapper => {
      const user = wrapper?.user;
      if (!user?.role || !user?.id) return;
      this.loadStats(user.role, user.id);
    });
  }

  private async loadStats(role: string, id: number): Promise<void> {
    const upper = role.toUpperCase();
    try {
      if (upper === 'ADMIN') {
        const [students, lecturers, courses] = await Promise.all([
          firstValueFrom(this.http.get<any[]>('/api/students')),
          firstValueFrom(this.http.get<any[]>('/api/lecturers')),
          firstValueFrom(this.http.get<any[]>('/api/courses')),
        ]);

        this.allData = { students, lecturers, courses };
        this.students = students;

        this.statsCards = [
          { title: 'Total Students', value: students.length, icon: '👥', color: 'blue' },
          { title: 'Total Lecturers', value: lecturers.length, icon: '🧑‍🏫', color: 'indigo' },
          { title: 'Total Courses', value: courses.length, icon: '📘', color: 'green' },
        ];
      }

      if (upper === 'LECTURER') {
        const [courses, exams] = await Promise.all([
          firstValueFrom(this.http.get<any[]>(`/api/lecturers/${id}/courses`)),
          firstValueFrom(this.http.get<any[]>('/api/exams')),
        ]);

        this.statsCards = [
          { title: 'My Courses', value: courses.length, icon: '📘', color: 'green' },
          { title: 'Total Exams', value: exams.length, icon: '📄', color: 'orange' },
        ];
      }

      if (upper === 'STUDENT') {
        const [courses, grades] = await Promise.all([
          firstValueFrom(this.http.get<any[]>(`/api/students/${id}/courses`)),
          firstValueFrom(this.http.get<any[]>(`/api/grades/student/${id}`)),
        ]);

        this.statsCards = [
          { title: 'Enrolled Courses', value: courses.length, icon: '📘', color: 'green' },
          { title: 'My Grades', value: grades.length, icon: '🏆', color: 'purple' },
        ];
      }
    } catch (err) {
      console.error('🚨 Failed to load stats:', err);
    }
  }
}
