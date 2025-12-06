import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallApp } from './install-app';

describe('InstallApp', () => {
  let component: InstallApp;
  let fixture: ComponentFixture<InstallApp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallApp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallApp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
