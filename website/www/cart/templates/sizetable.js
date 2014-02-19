module.exports = '<table class="sizetable table table-bordered table-responsive">\n<thead>\n  <tr class="wp-theme-3 bg-4">\n    <th>Size</th>\n    <th>Chest (cm)</th>\n    <th>Chest (in)</th>\n    <th>Length (cm)</th>\n  </tr>\n</thead>\n<tbody>\n<tr ng-repeat="size in sizes" style="cursor:hand;" ng-class="{selected:isselected(size)}" ng-click="choosetablesize(size);">\n  <td class="info"><strong>{{ size.name }}</strong></td>\n  <td>{{ size.chest[0] }} - {{ size.chest[1] }}</td>\n  <td>{{ size.chest[0] | cm2inch | number:1 }} - {{ size.chest[1] | cm2inch | number:1 }}</td>\n  <td>{{ size.length }}</td>\n</tr>\n</tbody>\n\n</table>';