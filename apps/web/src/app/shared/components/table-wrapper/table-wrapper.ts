import { Component, input, output } from '@angular/core';
import { LucideCircleAlert, LucideCommand, LucideInfo, LucideRefreshCw, LucideX } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  imports: [
    ToolbarModule,
    ButtonDirective,
    MessageModule,
    TooltipModule,
    LucideCircleAlert,
    LucideCommand,
    LucideInfo,
    LucideRefreshCw,
    LucideX,
  ],
  selector: 'app-table-wrapper',
  styleUrl: './table-wrapper.scss',
  templateUrl: './table-wrapper.html',
})
export class TableWrapper {
  refreshRequested = output();
  clearRequested = output();
  multiSortEnabled = input<boolean>(true);
  refreshError = input<string | null>(null);
}
