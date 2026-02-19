import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notificar } from './notificar';

describe('Notificar', () => {
  let component: Notificar;
  let fixture: ComponentFixture<Notificar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notificar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
