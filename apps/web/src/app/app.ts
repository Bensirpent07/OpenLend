import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideLayoutList, LucideMenu } from '@lucide/angular';
import {
  Sidebar, SidebarAside, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarLayout, SidebarMain, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarPanel, SidebarSpacer,
} from 'primeng/sidebar';
import { Drawer } from 'primeng/drawer';
import { ButtonDirective } from 'primeng/button';

@Component({
  imports: [
    Sidebar, SidebarAside, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader, SidebarLayout, SidebarMain, SidebarMenu,
    SidebarMenuButton, SidebarMenuItem, SidebarPanel, SidebarSpacer,
    Drawer, ButtonDirective, NgTemplateOutlet, RouterOutlet, RouterLink,
    RouterLinkActive, LucideLayoutList, LucideMenu,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly isMobile = signal(false);
  protected readonly mobileNavigationOpen = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationToggle = viewChild<ElementRef<HTMLButtonElement>>('navigationToggle');
  private readonly navigationLink = viewChild<ElementRef<HTMLAnchorElement>>('navigationLink');
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor() {
    afterNextRender(() => {
      const viewport = window.matchMedia('(max-width: 63.999rem)');
      const updateViewport = () => {
        this.isMobile.set(viewport.matches);
        this.mobileNavigationOpen.set(false);
      };
      updateViewport();
      viewport.addEventListener('change', updateViewport);
      this.destroyRef.onDestroy(() => {
        viewport.removeEventListener('change', updateViewport);
      });
    });
  }

  protected closeMobileNavigation(): void {
    this.mobileNavigationOpen.set(false);
    this.restoreNavigationFocus();
  }

  protected focusMobileNavigation(): void {
    this.navigationLink()?.nativeElement.focus();
  }

  protected restoreNavigationFocus(): void {
    this.navigationToggle()?.nativeElement.focus();
  }

  protected skipToContent(event: Event): void {
    event.preventDefault();
    this.mainContent()?.nativeElement.focus();
  }
}
