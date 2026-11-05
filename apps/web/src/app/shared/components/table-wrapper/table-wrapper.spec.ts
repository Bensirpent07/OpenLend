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

    const button = fixture.debugElement.query(By.css('button'));
    (button.nativeElement as HTMLButtonElement).click();

    expect(refreshRequested).toHaveBeenCalledOnce();
  });
});
