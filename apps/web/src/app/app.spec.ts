import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Drawer } from 'primeng/drawer';
import { App } from './app';

@Component({ template: '<h1>{{ title }}</h1>' })
class TestPage {
  readonly title = 'Test page';
}

describe('App navigation', () => {
  let fixture: ComponentFixture<App>;
  let viewport: EventTarget;
  let mobile: boolean;
  let element: HTMLElement;

  beforeEach(async () => {
    mobile = true;
    viewport = new EventTarget();
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      get matches() { return mobile; },
      addEventListener: viewport.addEventListener.bind(viewport),
      removeEventListener: viewport.removeEventListener.bind(viewport),
    })));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([
        { path: 'catalog', component: TestPage },
        { path: 'other', component: TestPage },
      ])],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    element = fixture.nativeElement as HTMLElement;
    await TestBed.inject(Router).navigateByUrl('/other');
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  async function openNavigation(): Promise<Drawer> {
    const button = fixture.debugElement.query(By.css('button[aria-controls="mobile-navigation"]'));
    expect(button).not.toBeNull();
    (button.nativeElement as HTMLButtonElement).click();
    await fixture.whenStable();
    return fixture.debugElement.query(By.directive(Drawer)).injector.get(Drawer);
  }

  it('opens mobile navigation and closes it after choosing Catalog', async () => {
    const drawer = await openNavigation();
    expect(drawer.visible()).toBe(true);

    const link = element.querySelector<HTMLAnchorElement>('a[href="/catalog"]');
    if (!link) throw new Error('Catalog navigation link was not rendered');
    link.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/catalog');
    expect(drawer.visible()).toBe(false);
    expect(document.activeElement).toBe(element.querySelector('button[aria-controls="mobile-navigation"]'));
  });

  it('keeps the toggle state synchronized when the drawer is dismissed', async () => {
    const drawer = await openNavigation();
    drawer.visible.set(false);
    await fixture.whenStable();

    const button = element.querySelector<HTMLButtonElement>('button[aria-controls="mobile-navigation"]');
    if (!button) throw new Error('Mobile navigation toggle was not rendered');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('moves skip-link focus to content without navigating away from the current route', () => {
    const link = element.querySelector<HTMLAnchorElement>('a[href="#main-content"]');
    if (!link) throw new Error('Skip link was not rendered');
    link.click();

    expect(document.activeElement).toBe(element.querySelector('main'));
    expect(TestBed.inject(Router).url).toBe('/other');
  });

  it('closes mobile navigation when switching to desktop and keeps it closed on return', async () => {
    await openNavigation();
    mobile = false;
    viewport.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.directive(Drawer))).toBeNull();
    expect(element.querySelector('nav[aria-label="Primary"]')).not.toBeNull();

    mobile = true;
    viewport.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const drawer = fixture.debugElement.query(By.directive(Drawer)).injector.get(Drawer);
    expect(drawer.visible()).toBe(false);
  });
});
