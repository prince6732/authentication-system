import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-processing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="flex flex-col items-center space-y-2">
        <div class="flex space-x-2">
          <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            class="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"
          ></div>
          <div
            class="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-400"
          ></div>
        </div>
        <span class="text-white mt-4">Processing, please wait...</span>
      </div>
    </div>
<!-- 
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="flex flex-col items-center space-y-4">
        <svg class="w-10 h-10 animate-spin" viewBox="0 0 50 50">
          <circle
            class="opacity-25"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="white"
            stroke-width="4"
          ></circle>
          <circle
            class="opacity-75"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="blue"
            stroke-width="3"
            stroke-dasharray="140"
            stroke-dashoffset="100"
          ></circle>
        </svg>
      </div>
    </div> -->
  `,
})
export class ProcessingComponent {}
