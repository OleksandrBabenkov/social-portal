import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../../../services/group';

@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-group-modal.html',
  styles: []
})
export class CreateGroupModal {
  @Output() close = new EventEmitter<void>();
  fb = inject(FormBuilder);
  groupService = inject(GroupService);
  isSubmitting = false;

  groupForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });

  async onSubmit() {
    if (this.groupForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      const { name, description } = this.groupForm.value;
      await this.groupService.createGroup(name!, description!);
      this.close.emit();
    } finally {
      this.isSubmitting = false;
    }
  }
}