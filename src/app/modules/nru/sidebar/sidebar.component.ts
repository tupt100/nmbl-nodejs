import { Component, OnInit } from '@angular/core';

import { NRUService } from '../nru.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  /**
   * Bindings
   */
  public logoUrl = '';
  public content = '';
  public messsage = '';

  constructor(private nruService: NRUService) { }

  ngOnInit() {
    this.getCompanyInformation();
  }

  /**
   * Get company information
   */
  getCompanyInformation = () => {
    this.nruService.getCompanyInfo().subscribe(result => {
      if (result) {
        this.logoUrl = result && result.results && result.results.length ? result.results[0].logo_url : 'assets/images/white-proxy.png';
        this.content = result.results[0].background_color;
        this.messsage = result.results[0].message;
      }
    });
  }
}
