/**
 * Canvas Events registrations
 * 
 * @package ESignBindingAddons
 */

// 
class Events {
  constructor(thisClass, args = {}) {
    this.args = {
      progress: {},
      ...args
    };
    this.setup_hooks();
  }
  setup_hooks() {}
  event_mousemove(event, thisClass) {
    const eSign = this;
  }
  event_mouseclick(event, thisClass) {
    const eSign = this;
    thisClass.lastEvent = event;
    const rectBox = eSign.canvas.bounding();
    const ratio =  eSign.canvas.ratio.update();
    // 
    // var event = thisClass.lastEvent;
    const widgets = thisClass.eSignature.widgets.filter(widget => {
      return (
        // Match top left
        widget.bBox.topLeft.x * ratio.width < event.offsetX &&
        widget.bBox.topLeft.y * ratio.height < event.offsetY &&
        // Match bottom left
        widget.bBox.bottomLeft.x * ratio.width < event.offsetX &&
        widget.bBox.bottomLeft.y * ratio.height > event.offsetY &&
        // Match top right
        widget.bBox.topRight.x * ratio.width > event.offsetX &&
        widget.bBox.topRight.y * ratio.height < event.offsetY &&
        // Match bottom right
        widget.bBox.bottomRight.x * ratio.width > event.offsetX &&
        widget.bBox.bottomRight.y * ratio.height > event.offsetY
      );
    });
    if (widgets.length >= 1) {
      const eventResults = widgets.map(widget => {
        if (widget?.onClick) {
          return widget.onClick(event, widget, thisClass);
        }
        return null;
      });
      // console.log(widgets);
      return widgets;
    }
    return false;
  }
}
export default Events;