import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'preparedPrice',
  standalone: true,
})
export class PreparedPricePipe implements PipeTransform {
  transform(value: number): string {
    // Check if it is number
    const price = typeof value === 'number' ? value : parseFloat(value);

    // If it's not a number or it is a NaN, return default value
    if (isNaN(price) || price == null) {
      return '0.00';
    }

    // Divide by 100 and format with 2 decimal positions
    return (price / 100).toFixed(2);
  }
}
