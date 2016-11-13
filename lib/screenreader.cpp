#include <nan.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>

using namespace v8;

Display *display = XOpenDisplay((char *) NULL);

Screen*  s = DefaultScreenOfDisplay(display);

void
get_pixel_color (Display *d, int x, int y, XColor *color) {
  XImage *image;
  image = XGetImage (d, RootWindow (d, DefaultScreen (d)), x, y, 1, 1, AllPlanes, XYPixmap);
  color->pixel = XGetPixel (image, 0, 0);
  XFree (image);
  XQueryColor (d, DefaultColormap(d, DefaultScreen (d)), color);
}
 

void Method(const Nan::FunctionCallbackInfo<v8::Value>& info) {

  if (info.Length() < 2) {
    Nan::ThrowTypeError("Wrong number of arguments");
    return;
  }

  if (!info[0]->IsNumber() || !info[1]->IsNumber()) {
    Nan::ThrowTypeError("Wrong arguments");
    return;
  }

  int index = info[0]->NumberValue();
  int length = info[1]->NumberValue();

  XColor c;
  get_pixel_color (display, 30, 40, &c);
  printf ("%d %d %d\n", c.red, c.green, c.blue);
  printf("%d %d\n", s->width, s->height);
  

  double result = (double) c.red;

  v8::Local<v8::Number> num = Nan::New(result);

  info.GetReturnValue().Set(num);
}

void Init(v8::Local<v8::Object> exports) {
  exports->Set(Nan::New("read").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(Method)->GetFunction());
}

NODE_MODULE(screenreader, Init)
