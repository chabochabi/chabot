import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  symbol: string;
  source: string;
  chart: Highstock.ChartObject;

  constructor() { }
}
