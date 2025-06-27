import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachableMachineComponent } from './teachable-machine.component';

describe('TeachableMachineComponent', () => {
  let component: TeachableMachineComponent;
  let fixture: ComponentFixture<TeachableMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeachableMachineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeachableMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
