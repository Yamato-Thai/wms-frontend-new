import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundListComponent } from './outbound-list.component';

describe('OutboundListComponent', () => {
  let component: OutboundListComponent;
  let fixture: ComponentFixture<OutboundListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutboundListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutboundListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
