import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionTuristica } from './informacion-turistica';

describe('InformacionTuristica', () => {
  let component: InformacionTuristica;
  let fixture: ComponentFixture<InformacionTuristica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionTuristica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionTuristica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
