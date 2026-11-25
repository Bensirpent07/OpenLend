import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableWrapper } from './table-wrapper';

describe('TableWrapper', () => {
  let component: TableWrapper;
  let fixture: ComponentFixture<TableWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWrapper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('emits one refresh request when the refresh button is clicked', () => {
    const refreshRequested = vi.fn();
    component.refreshRequested.subscribe(refreshRequested);

    const button = fixture.debugElement.query(By.css('button[aria-label="Refresh table"]'));
    (button.nativeElement as HTMLButtonElement).click();

    expect(refreshRequested).toHaveBeenCalledOnce();
  });

  it('emits one clear filters request when the clear button is clicked', () => {
    const clearRequested = vi.fn();
    component.clearRequested.subscribe(clearRequested);

    const button = fixture.debugElement.query(By.css('button[aria-label="Clear filters"]'));
    (button.nativeElement as HTMLButtonElement).click();

    expect(clearRequested).toHaveBeenCalledOnce();
  })

  it('hides the error immediately when retry clears it and restores the sort hint', () => {
    fixture.componentRef.setInput('refreshError', 'Unable to load catalog items.');
    fixture.detectChanges();
    const toolbar = (fixture.nativeElement as HTMLElement).querySelector('[role="toolbar"]');
    const alert = toolbar?.querySelector<HTMLElement>('[role="alert"]');
    const retry = Array.from(toolbar?.querySelectorAll('button') ?? []).find(
      (button) => button.textContent.trim() === 'Retry',
    );

    expect(alert?.parentElement?.hidden).toBe(false);
    expect(toolbar?.querySelector('kbd')).toBeNull();
    component.refreshRequested.subscribe(() => {
      fixture.componentRef.setInput('refreshError', null);
    });

    retry?.click();
    fixture.detectChanges();

    expect(alert?.parentElement?.hidden).toBe(true);
    expect(alert?.textContent).not.toContain('Unable to load catalog items.');
    expect(toolbar?.querySelector('kbd')?.textContent).toBe('Ctrl');
  });
});
