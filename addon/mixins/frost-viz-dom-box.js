import Ember from 'ember'
const {camelize} = Ember.String
import { mapObj } from 'ciena-frost-viz/utils/frost-viz-data-transform'

const CSS_INT_PROPERTIES = [
  'width',
  'height',
  'padding',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right'
]

const CSS_STRING_PROPERTIES = [
  'align'
]

export default Ember.Mixin.create({

  hasLayout: Ember.computed.notEmpty('box'),

  init () {
    this.set('box', Ember.Object.create())
    this._super(...arguments)
  },

  didRender () {
    Ember.run.scheduleOnce('afterRender', () => {
      const observeElement = this.$(this.get('boxObserveElement'))
      Ember.setProperties(this.get('box'), this.getBoxProperties(observeElement))
    })
  },

  getBoxProperties (target) {
    const element = target || this.$()
    const styleProperties = element.css(CSS_STRING_PROPERTIES)
    mapObj(element.css(CSS_INT_PROPERTIES), (key, value) => Ember.set(styleProperties, camelize(key), parseInt(value)))
    const rawElement = element[0]
    const observedProperties = rawElement.getBBox ? rawElement.getBBox() : element.position()
    return Object.assign(
      styleProperties,

      // The CSS properties are style intent. Use them if they returned something meaningful.
      styleProperties.width ? {} : {width: observedProperties.width},
      styleProperties.height ? {} : {height: observedProperties.height},

      // The element position should always be taken by observing the element
      {
        x: observedProperties.x || observedProperties.left || 0,
        y: observedProperties.y || observedProperties.top || 0
      }
    )
  }

})
