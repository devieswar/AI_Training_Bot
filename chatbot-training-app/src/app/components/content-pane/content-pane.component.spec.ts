import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  ContentPaneComponent } from './content-pane.component';

describe('ContentPaneComponent', () => {
  let component: ContentPaneComponent;
  let fixture: ComponentFixture<ContentPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
