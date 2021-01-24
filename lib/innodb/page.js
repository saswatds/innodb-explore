/**
 * A generic class for any type of page, which handles reading the common
 * FIL header and trailer, and can handle (via #parse) dispatching to a more
 * specialized class depending on page type (which comes from the FIL header).
 * A page being handled by Page indicates that its type is not currently
 * handled by any more specialized class.
 */
class Page {

}

Page.TYPE = {
  FSP_HDR: 8
}

module.exports = Page;