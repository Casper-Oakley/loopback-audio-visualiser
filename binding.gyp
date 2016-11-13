{
  "targets": [
    {
      "target_name": "screenreader",
      "sources": [ "lib/screenreader.cpp" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "libraries": [ "-lX11" ]
    }
  ]
}
