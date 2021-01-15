import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Component} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <input #symbol type="text" value="INTC" />
    <button [disabled]="loading" (click)="checkValue(symbol.value)">check</button>
    <br />
    {{ loading ?
      'loading...'
      : percentage && value ?
        percentage + '% ' + value : ''
    }}
  `,
})
export class AppComponent {
  public percentage: string;
  public value: string;
  public loading: boolean;

  constructor(
    private http: HttpClient,
  ) {}

  public checkValue(symbol: string): void {
    this.loading = true;
    this.http.get(`https://api.simplywall.st/api/search/${symbol}`)
      .pipe(
        map(result => result[0].url),
        switchMap(url => {
          return this.http.get(`https://api.simplywall.st/api/company/${url}?include=info%2Cscore%2Cscore.snowflake%2Canalysis.extended.raw_data%2Canalysis.extended.raw_data.insider_transactions&version=2.0`);
        }),
      )
      .subscribe(data => {
        const result = (data as any).data.analysis.data.intrinsic_discount;
        this.percentage = Math.abs(result).toFixed(2);
        if (result > 0) {
          this.value = 'undervalued';
        }
        else {
          this.value = 'overvalued';
        }

        this.loading = false;
      });
  }
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
