package global

import akka.actor.Cancellable
import models._
import models.content._
import java.io.{ File, FileInputStream }
import java.sql.Timestamp
import java.util.zip.GZIPInputStream
import org.openrdf.rio.RDFFormat
import org.pelagios.Scalagios
import org.pelagios.gazetteer.PlaceIndex
import play.api.Play
import play.api.Play.current
import play.api.{ Application, GlobalSettings, Logger }
import play.api.db.slick._
import scala.slick.jdbc.meta.MTable
import play.api.mvc.RequestHeader
import models.GlobalStatsHistory
import org.pelagios.api.gazetteer.Place
import scala.collection.mutable.ListBuffer

/** Play Global object **/
object Global extends GlobalSettings {
  
  private val GAZETTEER_DIR = "gazetteer"
  
  private val INDEX_DIR = "index"
    
  private var statsDemon: Option[Cancellable] = None
 
  lazy val index = {
    val idx = PlaceIndex.open(INDEX_DIR)
    if (idx.isEmpty) {
      Logger.info("Building new index")
      
      val dumps = Play.current.configuration.getString("recogito.gazetteers")
        .map(_.split(",").toSeq).getOrElse(Seq.empty[String]).map(_.trim)
        
      dumps.foreach(f => {
        Logger.info("Loading gazetteer dump: " + f)
        val (is, filename) = if (f.endsWith(".gz"))
            (new GZIPInputStream(new FileInputStream(new File(GAZETTEER_DIR, f))), f.substring(0, f.lastIndexOf('.')))
          else
            (new FileInputStream(new File(GAZETTEER_DIR, f)), f)
         
        idx.addPlaceStream(is, filename, true)
      })
      
      Logger.info("Index complete")      
    }
    idx
  }
  
  lazy val uploadDir = {
    val path = Play.current.configuration.getString("recogito.image.dir").getOrElse("public/uploads")
    val dir = new File(path)
    if (!dir.exists)
      dir.mkdir
    dir
  }
  
  lazy private val uploadBasePath = {
    val path = Play.current.configuration.getString("recogito.image.baseurl").getOrElse("/recogito/static/uploads/")
    if (path.endsWith("/"))
      path
    else
      path + "/"
  }
  
  def uploadBaseURL()(implicit request: RequestHeader) = {
    if (uploadBasePath.startsWith("http")) {
      uploadBasePath
    } else { 
      "http://" + request.host + uploadBasePath
    }
  }

  override def onStart(app: Application): Unit = {
    // Create DB tables if they don't exist
    DB.withSession { implicit session: Session =>
      if (MTable.getTables("users").list.isEmpty) {
        Logger.info("Users DB table does not exist - creating")
        Users.create
         
        // Create default admin user        
        val salt = Users.randomSalt
        Users.insert(User("admin", Users.computeHash(salt + "admin"), salt, new Timestamp(System.currentTimeMillis), "*", true))
      }
       
      if (MTable.getTables("gdocuments").list.isEmpty) {
        Logger.info("GeoDocuments DB table does not exist - creating")
        GeoDocuments.create
      }
      
      if (MTable.getTables("gdocument_parts").list.isEmpty) {
        Logger.info("GeoDocumentParts DB table does not exist - creating")
        GeoDocumentParts.create
      }
      
      if (MTable.getTables("gdocument_texts").list.isEmpty) {
        Logger.info("GeoDocumentTexts DB table does not exist - creating")
        GeoDocumentTexts.create
      }
      
      if (MTable.getTables("gdocument_images").list.isEmpty) {
        Logger.info("GeoDocumentImages DB table does not exist - creating")
        GeoDocumentImages.create
      }
      
      if (MTable.getTables("collection_memberships").list.isEmpty) {
        Logger.info("CollectionMemberships DB table does not exist - creating")
        CollectionMemberships.create
      }
      
      if (MTable.getTables("signoffs").list.isEmpty) {
        Logger.info("SignOffs DB table does not exist - creating")
        SignOffs.create
      }
      
      if (MTable.getTables("annotations").list.isEmpty) {
        Logger.info("Annotations DB table does not exist - creating")
        Annotations.create
      } 
       
      if (MTable.getTables("edit_history").list.isEmpty) {
        Logger.info("EditHistory DB table does not exist - creating")
        EditHistory.create
      }
        
      if (MTable.getTables("global_stats_history").list.isEmpty) {
        Logger.info("GlobalStatsHistory DB table does not exist - creating")
        GlobalStatsHistory.create
      }
      
      if (MTable.getTables("collection_stats_history").list.isEmpty) {
        Logger.info("CollectionStatsHistory DB table does not exist - creating")
        CollectionStatsHistory.create
      }
    }
    
    // Periodic stats logging
    val runStatsDemon = Play.current.configuration.getBoolean("recogito.stats.enabled").getOrElse(false)
    if (runStatsDemon) {
      Logger.info("Starting stats logging background actor")
      statsDemon = Some(StatsDemon.start())
    }
  }  
  
  override def onStop(app: Application): Unit = {
    if (statsDemon.isDefined) {
      Logger.info("Shutting down stats logging background actor")
      statsDemon.get.cancel
      statsDemon = None
    }
  }

}
