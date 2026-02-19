import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbara } from './navbara';

describe('Navbara', () => {
  let component: Navbara;
  let fixture: ComponentFixture<Navbara>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbara]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbara);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
