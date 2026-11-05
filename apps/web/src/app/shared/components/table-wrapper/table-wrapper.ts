import { Component, output } from '@angular/core';
import { LucideRefreshCw } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  imports: [ToolbarModule, ButtonDirective, LucideRefreshCw, TooltipModule],
  selector: 'app-table-wrapper',
  styleUrl: './table-wrapper.scss',
  templateUrl: './table-wrapper.html',
})
export class TableWrapper {
  refreshRequested = output();
}
